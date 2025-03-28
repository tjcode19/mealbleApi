const SubscriptionRepository = require("../repositories/subscriptionRepo");
const TimetableRepository = require("../repositories/timetableRepo");
const TimetableService = require("../services/timetableService");
const UserRepository = require("../repositories/userRepo");
const CR = require("../utils/customResponses");
const { google } = require("googleapis");
const path = require("path");
const { JwtHeader, verify } = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const axios = require("axios");

// Initialize auth with the JSON key file
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});
// Create a JWKS client to fetch Apple's public keys
const appleJwksClient = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys", // Apple's public keys URL
  cache: true,
});

const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

const packageName = "com.bolxtine.mealble";

class SubscriptionService {
  constructor() {
    this.repo = new SubscriptionRepository();
    this.userRepo = new UserRepository();
    this.timetableRepo = new TimetableRepository();
    this.timetableService = new TimetableService();
  }

  async buySub() {}

  // Verify a subscription purchase
  async verifyPurchase(productId, purchaseToken, isAndroid = true) {
    const androidPublisher = google.androidpublisher("v3");
    const authClient = await auth.getClient();
    const appleURL =
      process.env.NODE_ENV === "production"
        ? APPLE_PRODUCTION_URL
        : APPLE_SANDBOX_URL;

    var res;

    try {
      if (isAndroid) {
        const resBody = await androidPublisher.purchases.subscriptions.get({
          auth: authClient,
          packageName: packageName, // Your app's package name
          subscriptionId: productId, // e.g., 'monthly_premium'
          token: purchaseToken,
        });

        if (resBody.status === 200) {
          res = {
            status: 200,
            res: {
              code: CR.success,
              message: "Google Verification Successful",
              data: resBody.data,
            },
          };
        } else {
          res = {
            status: 404,
            res: {
              code: CR.notFound,
              message: "Google Verification Failed",
            },
          };
        }
      } else {
        const requestBody = {
          "receipt-data": purchaseToken,
          password: process.env.APPLE_SECRET_KEY, // App-specific shared secret (from App Store Connect)
          "exclude-old-transactions": true,
        };

        const response = await axios.post(appleURL, requestBody, {
          headers: { "Content-Type": "application/json" },
        });

        const { status, receipt, latest_receipt_info } = response.data;

        if (response.status === 200) {
          res = {
            status: 200,
            res: {
              code: CR.success,
              message: "Apple Verification Successful",
              data: { status, receipt, latest_receipt_info },
            },
          };
        } else {
          res = {
            status: 404,
            res: {
              code: CR.notFound,
              message: "Apple Verification Failed",
            },
          };
        }
      }

      return res;
    } catch (error) {
      // throw new Error(`Verification failed: ${error.message}`);

      console.log(`Verification failed: ${error.message}`);

      return (res = {
        status: 500,
        res: {
          code: CR.notFound,
          message: "Apple Verification Failed",
        },
      });
    }
  }

  // Verify a subscription purchase
  async acknowledgePurchase(productId, purchaseToken) {
    const androidPublisher = google.androidpublisher("v3");
    const authClient = await auth.getClient();

    try {
      const res = await androidPublisher.purchases.subscriptions.acknowledge({
        auth: authClient,
        packageName: packageName, // Your app's package name
        subscriptionId: productId, // e.g., 'monthly_premium'
        token: purchaseToken,
        requestBody: {
          // Empty payload (required by Google)
        },
      });

      return {
        status: 200,
        res: {
          code: CR.success,
          message: "Acknowledgement Successful",
          data: res.data,
        },
      };
    } catch (error) {
      // throw new Error(`Acknowledgement failed: ${error.message}`);
      return {
        status: 500,
        res: {
          code: CR.notFound,
          message: `Acknowledgement Failed: ${error.message}`,
        },
      };
    }
  }

  async decodeJwtHeader(token) {
    const [headerEncoded] = token.split('.');
    const header = Buffer.from(headerEncoded, 'base64').toString();
    return JSON.parse(header);
  }

  // Verify the JWT signature and decode the payload
  async verifyAppleJWT(jwtPayload) {
    try {
      // Extract the JWT header to get the key ID (kid)
      const header = this.decodeJwtHeader(jwtPayload.signedPayload)

      // Get the public key from Apple's JWKS endpoint
      const key = await appleJwksClient.getSigningKey(header.kid);
      const publicKey = key.getPublicKey();

      // 3. Verify the JWT
      const decoded = verify(signedPayload, publicKey, {
        algorithms: ["RS256"],
        issuer: "appstoreconnect-v1", // Validate the issuer
        audience: "com.bolxtine.mealbleapp", // e.g., 'com.yourapp.ios'
      });

      return decoded;
    } catch (error) {
      throw new Error(
        `Apple notification verification failed: ${error.message}`
      );
    }
  }

  async handleAppleNotification(decoded) {
    const notificationType = decoded.notificationType;
    const transactionInfo = decoded.data.signedTransactionInfo;

    // Handle different notification types
    switch (notificationType) {
      case "DID_RENEW":
        // Update subscription expiry date
        await updateSubscription(transactionInfo);
        break;
      case "DID_FAIL_TO_RENEW":
        // Handle payment failure
        break;
      default:
        console.log("Unhandled notification type:", notificationType);
    }
  }

  async appleRTDN(payload) {
    console.log("Apple RTDN hit");
    try {
      const decoded = await this.verifyAppleJWT(payload);

      const notificationType = decoded.notificationType;
      const transactionInfo = decoded.data.signedTransactionInfo;


      console.log(transactionInfo);


      // 3. Find the user in your database
      const table = await this.timetableRepo.getByQuery({
        purchaseToken: purchaseToken,
        active: true,
      });

      const tTable = table[0];

      if (!tTable) {
        return {
          status: 500,
          res: {
            code: CR.notFound,
            message: "Timetable not Found",
          },
        };
      }

      // 4. Update the user's subscription
      const res = await this.updateSub(
        notificationType,
        purchaseToken,
        tTable._id,
        tTable.owner, // Corrected: Use owner directly
        tTable.sub._id, // Corrected: Use _id instead of id
        tTable.subData.period, // Corrected: Ensure period is correct
        tTable.subData.shuffle, // Corrected: Shuffle is inside subData
        tTable.subData.regenerate // Corrected: Regenerate is inside subData
      );

      return res;
    } catch (error) {
      console.error("RTDN error:", error);
      res.status(500).send("RTDN handling failed");
    }
  }

  async googleRTDN(decodedData) {
    try {
      const { subscriptionNotification } = decodedData;
      const { subscriptionId, purchaseToken, notificationType } =
        subscriptionNotification;

      // console.log(subscriptionNotification);

      // 1. Verify the notification with Google Play API
      const authClient = await auth.getClient();
      const androidPublisher = google.androidpublisher("v3");
      const subscription = await androidPublisher.purchases.subscriptions.get({
        auth: authClient,
        packageName: packageName, // Your app's package name
        subscriptionId: subscriptionId,
        token: purchaseToken,
      });

      if (subscription.status == 200) {
        this.acknowledgePurchase(subscriptionId, purchaseToken);
      }

      // 2. Extract subscription details
      const expiryTime = new Date(parseInt(subscription.data.expiryTimeMillis));
      const linkedPurchaseToken = subscription.data.linkedPurchaseToken;

      // 3. Find the user in your database
      const table = await this.timetableRepo.getByQuery({
        purchaseToken: purchaseToken,
        active: true,
      });

      const tTable = table[0];

      if (!tTable) {
        return {
          status: 500,
          res: {
            code: CR.notFound,
            message: "Timetable not Found",
          },
        };
      }

      // 4. Update the user's subscription
      const res = await this.updateSub(
        notificationType,
        purchaseToken,
        tTable._id,
        tTable.owner, // Corrected: Use owner directly
        tTable.sub._id, // Corrected: Use _id instead of id
        tTable.subData.period, // Corrected: Ensure period is correct
        tTable.subData.shuffle, // Corrected: Shuffle is inside subData
        tTable.subData.regenerate // Corrected: Regenerate is inside subData
      );

      return res;
    } catch (error) {
      console.error("RTDN error:", error);
      res.status(500).send("RTDN handling failed");
    }
  }

  async updateSub(
    notificationType,
    purchaseToken,
    tId,
    userId,
    subId,
    dur,
    shuffle,
    regenerate
  ) {
    switch (notificationType) {
      case 1: // SUBSCRIPTION_RECOVERED
      case 2:
      case "DID_RENEW": {
        const a = await this.timetableRepo.updateData(tId, { active: false });

        if (a != null) {
        }

        const cal = await this.timetableService.createData(
          userId,
          subId,
          dur,
          shuffle,
          regenerate,
          purchaseToken
        );
        return cal;
      }

      case 3: // SUBSCRIPTION_CANCELED
        console.log("subscription cancelled");
        break;
      case 4: // SUBSCRIPTION_PURCHASED
        // New subscription
        break;
      case 5: // SUBSCRIPTION_ON_HOLD (e.g., payment failed)
        // Handle grace period
        break;
      default:
        console.log("Unknown notification type:", notificationType);
    }
  }

  async createData(data) {
    try {
      const cal = await this.repo.createData(data);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Sub Added Successfully",
            data: cal,
          },
        };
      } else {
        return {
          status: 500,
          res: {
            code: CR.notFound,
            message: "Operation Failed",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }

      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In Create TimetableService",
        },
      };
    }
  }

  async getAll(userId) {
    try {
      const cal = await this.repo.getAll();
      const user = await this.userRepo.getUserById(userId);
      let c;

      if (cal) {
        c = cal;
        // if (user.usedFree) {
        //   c = cal.slice(1);
        // }
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Subscription Query Successful",
            data: c,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }

      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async getByRange(limit, offset, query) {
    try {
      const cal = await this.repo.getByTag(limit, offset, query);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }

      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetByTag MealService",
        },
      };
    }
  }

  async getById(id) {
    try {
      const cal = await this.repo.getById(id);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In Get BY ID SubService",
        },
      };
    }
  }

  async mealExist(name) {
    try {
      const cal = await this.repo.getByQuery({ name: name });

      console.log(cal, "here");
      if (cal) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async updateData(id, data) {
    try {
      const cal = await this.repo.updateData(id, data);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Update Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async deleteData(id) {
    try {
      const cal = await this.repo.deleteData(id);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Delete Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }
}

module.exports = SubscriptionService;
