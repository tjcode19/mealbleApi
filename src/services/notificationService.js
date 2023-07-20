const NotificationRepository = require("../repositories/notificationRepo");
const CR = require("../utils/customResponses");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary").v2;
const uploader = require("../utils/multer");

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("../utils/mealble-firebase-adminsdk-34mil-05284418f5.json"); // Replace with the path to your serviceAccountKey.json file
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

    console.log(message);

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

  async createData(data) {
    try {
      const cal = await this.repo.createData(data);
      if (cal) {
        return {
          status: 201,
          res: {
            code: CR.success,
            message: "Meal Added Successfully",
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

  async getAll(limit, offset) {
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

  async getByTag(limit, offset, type) {
    try {
      const cal = await this.repo.getByTag(limit, offset, type);
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
          dev: "In Get BY ID MealService",
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

  async uploadImage(id, file) {
    try {
      let errM = false;

      const upload = await cloudinary.uploader.upload(file.path);

      let res;

      if (!upload) {
        res = {
          status: 400,
          res: {
            code: CR.notFound,
            message: "Error while uploading the file",
          },
        };
      }
      const cal = await this.repo.updateData(id, {
        imageUrl: upload.secure_url,
      });

      if (cal)
        res = {
          status: 200,
          res: {
            code: CR.success,
            message: "Upload Successful",
          },
        };
      else
        res = {
          status: 400,
          res: {
            code: CR.badRequest,
            message: "Upload Failed",
          },
        };
      return res;
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
          dev: "In UploadImage MealService",
        },
      };
    }
  }
}

module.exports = MealService;
