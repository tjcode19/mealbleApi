const UserRepository = require("../repositories/userRepo");
const AuthRepository = require("../repositories/authRepo");
const CommonService = require("../services/commonService");
const CR = require("../utils/customResponses");
const CU = require("../utils/utils");
const bcrypt = require("bcrypt");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.authRepository = new AuthRepository();
    this.commonService = new CommonService();
  }

  async createUser(userData) {
    return await this.userRepository.createUser(userData);
  }

  async getAllUsers(limit, offset) {
    return await this.userRepository.getAllUsers(limit, offset);
  }

  async getUserById(userId) {
    try {
      let user = await this.userRepository.getUserById(userId);
      if (user) {
        const activeSub = await this.commonService.isActiveSub(userId);

        const isFreshUser = await this.commonService.isFreshUser(userId);

        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query User By Successful",
            data: { user, activeSub, isFreshUser },
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "User not found",
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
        res: { code: CR.serverError, message: "Internal server error" + error },
      };
    }
  }

  async updateUser(userId, userData) {
    return await this.userRepository.updateUser(userId, userData);
  }

  async deleteUser(userId) {
    return await this.userRepository.deleteUser(userId);
  }

  async checkUserExists(email) {
    return await this.userRepository.getUserByQuery({ email: email });
  }

  async checkOtpExist(otp, userId) {
    return await this.userRepository.getUserByQuery({ otp: otp, _id: userId });
  }

  async verifyEmail(otp, password, userId) {
    try {
      const otpExist = await this.checkOtpExist(otp, userId);
      if (otpExist) {
        const saltR = 10;
        const hashPass = await bcrypt.hash(password, saltR);
        let data = {
          username: otpExist.email,
          password: hashPass,
          salt: saltR,
          _id: userId,
        };
        const newAuth = await this.authRepository.createAuth(data);
        if (newAuth) {
          this.updateUser(userId, { otp: "" });
          const t = CU.generateAccessToken({
            userId: userId,
            type: "User",
          });
          return {
            status: 201,
            res: {
              code: CR.accepted,
              message: "Email Verification Successful",
              data: {
                token: t,
              },
            },
          };
        } else {
          return {
            status: 500,
            res: {
              code: CR.serverError,
              message: "Request Failed",
            },
          };
        }
      } else {
        return {
          status: 400,
          res: {
            code: CR.badRequest,
            message: "Invalid OTP",
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
          dev: "In Verify Email UserService",
        },
      };
    }
  }
}

module.exports = UserService;
