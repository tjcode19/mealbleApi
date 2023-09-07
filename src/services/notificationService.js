const NotificationRepository = require("../repositories/notificationRepo");
const CR = require("../utils/customResponses");
require("dotenv/config");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK

const serviceAccount = require("../../mealble-firebase-adminsdk-34mil-05284418f5.json"); // Replace with the path to your serviceAccountKey.json file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class MealService {
  constructor() {
    this.repo = new NotificationRepository();
  }

  async sendPushNotification(token, topic, title, body, data) {
    let message;

    if (token === null || token === "") {
      message = {
        topic: topic,
        notification: {
          title: title,
          body: body,
        },
        data: data,
      };
    } else {
      message = {
        token: token,
        notification: {
          title: title,
          body: body,
        },
        data: data,
      };
    }

    // console.log(message);

    try {
      const response = await admin.messaging().send(message);
      console.log("Successfully sent notification:", response);

      return {
        status: 200,
        res: {
          code: CR.success,
          message: "Successfully sent notification",
        },
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  async createMessage(data) {
    try {
      const cal = await this.repo.createData(data);
      if (cal) {
        return {
          status: 201,
          res: {
            code: CR.success,
            message: "Message Created Successfully",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
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
          dev: "In Create Message Service",
        },
      };
    }
  }

  async getAllMessages(limit, offset) {
    try {
      const cal = await this.repo.getAll(limit, offset);
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
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async getMessageByQuery(query) {
    try {
      const cal = await this.repo.getByQuery(query);
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
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async sendEmail(to, subject, htmlBody) {
    try {
      // Create a Nodemailer transporter using SMTP
      const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com", // Replace with your SMTP server details
        port: 465, // Replace with the desired port number (e.g., 587 for TLS, 465 for SSL)
        secure: true, // Set to true if you're using port 465 with SSL
        auth: {
          user: "info@bolxtine.com",
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email options
      const mailOptions = {
        from: "Mealble <info@bolxtine.com>", // Replace with the sender email address
        to,
        subject,
        html: htmlBody,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return {
            status: 500,
            res: {
              code: CR.badRequest,
              message: "Error Occured",
            },
          };
        } else {
          return {
            status: 200,
            res: {
              code: CR.success,
              message: "Email Sent Successful",
            },
          };
        }
      });

      // .then((msg) => console.log(msg)) // logs response data
      // .catch((err) => console.log(err)); // logs any error
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

module.exports = MealService;
