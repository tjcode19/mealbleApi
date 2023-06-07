// const currencyService = require("../services/currency");

const AuthService = require("../services/authService");
const UserService = require("../services/userService");
const CR = require("../utils/customResponses");
const CU = require("../utils/utils");
const bcrypt = require("bcrypt");

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (email == null || email === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Email is required",
        });
      }

      if (password == null || password === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Password is required",
        });
      }

      const login = await this.authService.login(email, password);

      res.status(login.status).json(login.res);
    } catch (error) {
      res.status(500).json({
        code: CR.serverError,
        message: "Internal server error",
        dev: "In authController",
      });
    }
  }

  async sendOtp(req, res) {
    try {
      const { email } = req.body;

      if (email == null || email === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Email is required",
        });
      }

      const otp = await this.authService.sendOtp(email);

      res.status(otp.status).json(otp.res);
    } catch (error) {
      res.status(500).json({
        code: CR.serverError,
        message: "Internal server error:" + error,
        dev: "In SendOtp authController",
      });
    }
  }

  async setPassword(req, res) {
    try {
      const { otp, password } = req.body;
      const userId = req.params.id;

      if (password == null || password === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Password is required",
        });
      }

      if (otp == null || otp === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "OTP is required",
        });
      }
      if (userId == null || userId === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "User ID is required",
        });
      }

      const newAuth = await this.authService.setPassword(otp, userId, password);

      res.status(newAuth.status).json(newAuth.res);
    } catch (error) {
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const { userId } = req.decoded;

      if (newPassword == null || newPassword === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "New Password is required",
        });
      }

      if (currentPassword == null || currentPassword === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Current Password is required",
        });
      }

      const newAuth = await this.authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.status(newAuth.status).json(newAuth.res);
    } catch (error) {
      res
        .status(500)
        .json({
          code: CR.serverError,
          message: "Internal server error",
          dev: "AuthController => Change Password",
        });
    }
  }
}

module.exports = AuthController;
