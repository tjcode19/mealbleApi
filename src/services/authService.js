const AuthRepository = require("../repositories/authRepo");
const UserService = require("../services/userService");
const bcrypt = require("bcrypt");

const CR = require("../utils/customResponses");
const CU = require("../utils/utils");

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
    this.userService = new UserService();
  }

  async createAuth(userData) {
    return await this.authRepository.createAuth(userData);
  }

  async login(email, password) {
    let response;
    try {
      const login = await this.authRepository.login(email);
      if (login) {
        const passwordMatch = await bcrypt.compare(password, login.password);

        if (passwordMatch) {
          const t = CU.generateAccessToken({
            userId: login._id,
            type: login.role,
          });
          response = {
            status: 200,
            res: {
              code: CR.success,
              message: "Login Successful",

              data: {
                token: t,
                userId: login._id,
              },
            },
          };
        } else {
          response = {
            status: 400,
            res: {
              code: CR.badRequest,
              message: "Invalid Password",
            },
          };
        }
      } else {
        const userExistNotVerified = this.userService.checkUserExists(email);

        if (!userExistNotVerified) {
          return {
            status: 404,
            res: {
              code: CR.notFound,
              message: "Login Failed",
            },
          };
        }
        const sendOtp = await this.sendOtp(email);

        if (sendOtp.status === 200) {
          response = {
            status: 200,
            res: {
              code: CR.success,
              otp: sendOtp.res.data.otp,
              userId: sendOtp.res.data.userId,
              message:
                "You are yet to verify email, an otp has been sent to your email",
            },
          };
        }
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
          dev: "In Login AuthService",
        },
      };
    }
    return response;
  }

  async sendOtp(email) {
    try {
      const otp = CU.generateOTP(6);
      const userExist = await this.userService.checkUserExists(email);

      if (userExist) {
        const updateUser = await this.userService.updateUser(userExist._id, {
          otp: otp,
        });

        //Send otp to email
        //To be implemented

        if (updateUser) {
          return {
            status: 200,
            res: {
              code: CR.success,
              message: "OTP Sent Successfully",
              data: {
                otp: otp,
                userId: userExist._id,
              },
            },
          };
        } else {
          return {
            status: 500,
            res: {
              code: CR.serverError,
              message: "Failed Action",
            },
          };
        }
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "User Not Found",
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
          dev: "In SendOtp Service",
        },
      };
    }
  }

  async setPassword(otp, userId, password) {
    try {
      const otpExist = await this.userService.checkOtpExist(otp, userId);
      if (!otpExist) {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "Invalid OTP",
          },
        };
      }

      const saltR = 10;
      const hashPass = await bcrypt.hash(password, saltR);

      const newAuth = await this.updateAuth(userId, {
        password: hashPass,
      });

      if (newAuth) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Password Set Successfully",
          },
        };
      } else {
        return {
          status: 500,
          res: {
            code: CR.serverError,
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
          dev: "In SetPassword Service",
        },
      };
    }
  }

  async changePassword(otp, userId, password) {
    try {
      const otpExist = await this.userService.checkOtpExist(otp, userId);
      if (!otpExist) {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "Invalid OTP",
          },
        };
      }

      const saltR = 10;
      const hashPass = await bcrypt.hash(password, saltR);

      const newAuth = await this.updateAuth(userId, {
        password: hashPass,
      });

      if (newAuth) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Password Set Successfully",
          },
        };
      } else {
        return {
          status: 500,
          res: {
            code: CR.serverError,
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
          dev: "In SetPassword Service",
        },
      };
    }
  }

  async updateAuth(userId, userData) {
    return await this.authRepository.updateAuth(userId, userData);
  }

  async deleteAuth(userId) {
    return await this.authRepository.deleteAuth(userId);
  }
}

module.exports = AuthService;
