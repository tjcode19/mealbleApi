// const currencyService = require("../services/currency");

const AuthService = require("../services/authService");
const CR = require("../utils/customResponses");
const CU = require("../utils/utils");
const bcrypt = require("bcrypt");

class AuthController {
  constructor() {
    this.authService = new AuthService();
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
}

module.exports = AuthController;
