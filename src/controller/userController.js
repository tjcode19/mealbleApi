// src/controllers/userController.js

const UserService = require("../services/userService");
const AuthService = require("../services/authService");
const NotificationService = require("../services/notificationService");
const CR = require("../utils/customResponses");
const CU = require("../utils/utils");
var inlineCss = require("inline-css");
const { verifyEmailTemp } = require("../html_temp/email_verification_temp");

class UserController {
  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService();
    this.notiService = new NotificationService();
  }

  async createUser(req, res) {
    try {
      const userData = req.body;

      // Input validation in the controller
      if (!userData.email) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Valid email is required",
        });
      }

      // Check for a valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Invalid email format",
        });
      }

      // Check if the user already exists
      const otp = CU.generateOTP(6);
      userData.otp = otp; //otp;
      const userExists = await this.userService.checkUserExists(userData.email);
      if (userExists) {
        return res
          .status(409)
          .json({ code: CR.existingData, message: "User already exists" });
      }

      const newUser = await this.userService.createUser(userData);
      if (newUser) {
        //Send an email to be implemented
        var html = verifyEmailTemp({ otp: otp });

        inlineCss(html, { url: "fake" }).then(function (htm) {
          html = htm;
        });

        this.notiService.sendEmail(userData.email, "Email Verification", html);

        res.status(201).json({
          code: CR.accepted,
          message: "Request Successful",
          data: newUser,
        });
      } else {
        res.status(500).json({
          code: CR.serverError,
          message: "Request Failed",
        });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }
      res.status(500).json({
        code: CR.serverError,
        message: "Internal server error UserController " + error,
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { otp, password, userId } = req.body;

      // Input validation in the controller
      if (!otp) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "OTP is required",
        });
      }
      if (!password) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Password is required",
        });
      }
      if (!userId) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "User ID is required as parameter",
        });
      }

      const cal = await this.userService.verifyEmail(otp, password, userId);

      res.status(cal.status).json(cal.res);
    } catch (error) {
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }

  async getAllUsers(req, res) {
    try {
      const page = req.query.page || 1; // Current page number
      const limit = req.query.limit || 10; // Number of items per page
      const offset = (page - 1) * limit; // Offset to skip the required number of items

      const users = await this.userService.getAllUsers(limit, offset);
      if (users) {
        res.status(200).json({
          code: CR.success,
          message: "Request Successful",
          data: users,
        });
      } else {
        res.status(404).json({ code: CR.notFound, message: "User not found" });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.decoded;

      const user = await this.userService.getUserById(userId);
      res.status(user.status).json(user.res);
    } catch (error) {
      res.status(500).json({
        code: CR.serverError,
        message: "Internal server error",
        dev: "In authController" + error,
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { userId } = req.decoded;
      const userData = req.body;
      const updatedUser = await this.userService.updateUser(userId, userData);
      if (updatedUser) {
        res.status(200).json({
          code: CR.success,
          message: "Request Successful",
          data: updatedUser,
        });
      } else {
        res.status(404).json({ code: CR.notFound, message: "User not found" });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }
      res.status(500).json({
        code: CR.serverError,
        message: "Internal server error" + error,
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.decoded;
      const deletedUser = await this.userService.deleteUser(userId);

      if (deletedUser) {
        const delAuth = await this.authService.deleteAuth(userId);
        if (delAuth) {
          res
            .status(200)
            .json({
              code: CR.success,
              message: "Request Successful",
            })
            .end();
        }
      } else {
        res.status(404).json({ code: CR.notFound, message: "User not found" });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }
}

module.exports = UserController;
