const SubscriptionRepository = require("../repositories/subscriptionRepo");
const TimetableRepository = require("../repositories/timetableRepo");
const TimetableService = require("../services/timetableService");
const UserRepository = require("../repositories/userRepo");
const CR = require("../utils/customResponses");
const { google } = require("googleapis");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { JwtHeader, verify } = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const axios = require("axios");
const fetch = require("node-fetch");

// Initialize auth with the JSON key file
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});
// Create a JWKS client to fetch Apple's public keys
// Initialize JWKS client for Apple
const appleJwksClient = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
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
  async verifyPurchase(productId, purchaseToken, isAndroid) {
    const androidPublisher = google.androidpublisher("v3");
    const authClient = await auth.getClient();
    const appleURL =
      process.env.NODE_ENV === "production"
        ? APPLE_PRODUCTION_URL
        : APPLE_SANDBOX_URL;

    let res;

    try {
      if (isAndroid) {
        const resBody = await androidPublisher.purchases.subscriptions.get({
          auth: authClient,
          packageName: packageName, // Your app's package name
          subscriptionId: productId, // e.g., 'monthly_premium'
          token: purchaseToken,
        });

        console.log("Latest Trans Android:", resBody);

        if (resBody.status === 200) {
          res = {
            status: 200,
            res: {
              code: CR.success,
              message: "Google Verification Successful",
              data: resBody.data,
              data: {
                productId: productId,
                purchaseToken: purchaseToken,
                acknowledgementState: 0,
              },
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

        console.log("Latest Trans Apple:", latest_receipt_info[0]);

        if (response.status === 200) {
          res = {
            status: 200,
            res: {
              code: CR.success,
              message: "Apple Verification Successful",
              data: {
                productId: latest_receipt_info[0].product_id,
                purchaseToken: latest_receipt_info[0].original_transaction_id,
                acknowledgementState: 0,
              },
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

  decodeJwtHeader(token) {
    const [headerEncoded] = token.split(".");
    const header = Buffer.from(headerEncoded, "base64").toString();
    return JSON.parse(header);
  }

  // Verify the JWT signature and decode the payload
  async verifyAppleJWT(jwtPayload) {
    try {
      // Extract the JWT header to get the key ID (kid)

      const header = this.decodeJwtHeader(jwtPayload);
      // Get the first certificate from x5c
      const certBase64 = header.x5c[0];
      const certDer = Buffer.from(certBase64, "base64");

      // Parse the certificate
      const cert = new crypto.X509Certificate(certDer);

      // Export the public key in PEM format
      const publicKey = cert.publicKey.export({
        type: "spki",
        format: "pem",
      });

      // 3. Verify the JWT
      const decoded = verify(jwtPayload, publicKey, {
        algorithms: ["ES256"],
      });

      return decoded;
    } catch (error) {
      throw new Error(
        `Apple notification verification failed: ${error.message}`
      );
    }
  }

  async appleRTDN(payload) {
    try {
      const decoded = await this.verifyAppleJWT(payload.signedPayload);

      const notificationType = decoded.notificationType;
      const transactionInfo = await this.verifyAppleJWT(
        decoded.data.signedTransactionInfo
      );

      console.log("DecodedApple", transactionInfo);

      const purchaseToken = transactionInfo.originalTransactionId;

      // 4. Update the user's subscription
      const res = await this.updateSub(notificationType, purchaseToken);

      return {
        status: 200,
        res: res,
      };
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
        // res.status(200).send('OK');
        await this.acknowledgePurchase(subscriptionId, purchaseToken);
      }

      // 4. Update the user's subscription
      const res = await this.updateSub(notificationType, purchaseToken);

      return res;
    } catch (error) {
      console.error("RTDN error:", error);
      res.status(500).send("RTDN handling failed");
    }
  }

  async updateSub(notificationType, purchaseToken) {
    switch (notificationType) {
      case 1: // SUBSCRIPTION_RECOVERED
      case 2:
      case "DID_RENEW": {
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
        const a = await this.timetableRepo.updateData(tTable._id, {
          active: false,
        });

        if (a != null) {
        }

        const cal = await this.timetableService.createData(
          tTable.owner,
          tTable.sub._id,
          tTable.subData.period,
          tTable.subData.shuffle,
          tTable.subData.regenerate,
          purchaseToken
        );

        return cal;
      }

      case 3: // SUBSCRIPTION_CANCELED
        console.log("subscription cancelled");
        break;
      case 4: // SUBSCRIPTION_PURCHASED
        // New subscription
        console.log("subscription cancelled now");
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
