// const currencyService = require("../services/currency");

const AuthService = require("../services/authService");
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

      const login = await this.authService.login(email);

      if (login) {
        const passwordMatch = await bcrypt.compare(password, login.password);

        if (passwordMatch) {
          const t = CU.generateAccessToken({
            userId: login._id,
            type: login.role,
          });
          res.status(200).json({
            code: CR.success,
            message: "Login Successful",
            data: {
              token: t,
              userId: login._id,
            },
          });
        } else {
          return res.status(400).json({
            code: CR.badRequest,
            message: "Invalid Password",
          });
        }
      } else {
        res.status(404).json({
          code: CR.notFound,
          message: "Login Failed",
        });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }

      console.log(error);
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
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

      const otp = CU.generateOTP(6);
      const userExist = await this.userService.checkUserExists(email);

      if (userExist) {
        const updateUser = await this.userService.updateUser(userExist._id, {
          otp: otp,
        });

        //Send otp to email
        //To be implemented

        if (updateUser) {
          res.status(200).json({
            code: CR.success,
            message: "OTP Sent Successfully",
            data: {
              otp: otp,
              userId: userExist._id,
            },
          });
        } else {
          return res.status(500).json({
            code: CR.serverError,
            message: "Failed Action",
          });
        }
      } else {
        res.status(404).json({
          code: CR.notFound,
          message: "User Not Found",
        });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }

      console.log(error);
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }

  async setPassword(req, res) {
    try {
      const { otp, password, userId } = req.body;

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

      const otpExist = await this.userService.checkOtpExist(otp, userId);
      if (!otpExist) {
        return res.status(404).json({
          code: CR.notFound,
          message: "Invalid OTP",
        });
      }

      const saltR = 10;
      const hashPass = await bcrypt.hash(password, saltR);
      let data = {
        password: hashPass,
        salt: saltR,
      };
      const newAuth = await this.authService.updateAuth(userId, data);

      if (newAuth) {
        res.status(200).json({
          code: CR.success,
          message: "Password Set Successfully",
        });
      } else {
        res.status(500).json({
          code: CR.serverError,
          message: "Operation Failed",
        });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }

      console.log(error);
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

      const saltR = 10;
      const hashPass = await bcrypt.hash(newPassword, saltR);

      const newAuth = await this.authService.updateAuth(userId, {
        password: hashPass,
      });

      if (newAuth) {
        res.status(200).json({
          code: CR.success,
          message: "Password Changed Successfully",
        });
      } else {
        res.status(500).json({
          code: CR.serverError,
          message: "Operation Failed",
        });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }

      console.log(error);
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }
}

module.exports = AuthController;
