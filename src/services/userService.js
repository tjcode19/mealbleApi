const UserRepository = require("../repositories/userRepo");
const CR = require("../utils/customResponses");
const CU = require("../utils/utils");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData) {
    return await this.userRepository.createUser(userData);
  }

  async getAllUsers(limit, offset) {
    return await this.userRepository.getAllUsers(limit, offset);
  }

  async getUserById(userId) {
    return await this.userRepository.getUserById(userId);
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
      const otpExist = await this.userService.checkOtpExist(otp, userId);
      if (otpExist) {
        const saltR = 10;
        const hashPass = await bcrypt.hash(password, saltR);
        let data = {
          username: otpExist.email,
          password: hashPass,
          salt: saltR,
          _id: userId,
        };
        const newAuth = await this.authService.createAuth(data);
        if (newAuth) {
          this.userService.updateUser(userId, { otp: "" });
          const t = CU.generateAccessToken({
            userId: userId,
            type: "User",
          });
          return {
            status: 201,
            res: {
              code: CR.accepted,
              message: "Request Successful",
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
          dev: "In Login AuthService",
        },
      };
    }
  }
}

module.exports = UserService;
