const AuthRepository = require("../repositories/authRepo");
const TimetableRepository = require("../repositories/timetableRepo");
const UserService = require("../services/userService");
const CommonService = require("../services/commonService");
const bcrypt = require("bcrypt");

const NotificationService = require("../services/notificationService");
var inlineCss = require("inline-css");
const { verifyEmailTemp } = require("../html_temp/email_verification_temp");

const CR = require("../utils/customResponses");
const CU = require("../utils/utils");

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
    this.timetableRepo = new TimetableRepository();
    this.userService = new UserService();
    this.commonService = new CommonService();
    this.notiService = new NotificationService();
  }

  async createAuth(userData) {
    return await this.authRepository.createAuth(userData);
  }

  async login(email, password) {
    try {
      const login = await this.authRepository.login(email);

      if (login) {
        const passwordMatch = await bcrypt.compare(password, login.password);

        if (passwordMatch) {
          const hasActiveSub = await this.commonService.isActiveSub(login._id);

          const uData = {
            activeSub: hasActiveSub.length > 0 ? true : false,
            email: email,
          };
          const t = CU.generateAccessToken({
            userId: login._id,
            type: login.role,
          });
          return {
            status: 200,
            res: {
              code: CR.success,
              message: "Login was Successful",

              data: {
                token: t.token,
                tokenExp: t.expirationDate,
                ...uData,
                userId: login._id,
              },
            },
          };
        } else {
          return {
            status: 400,
            res: {
              code: CR.badRequest,
              message: "Invalid Password",
            },
          };
        }
      } else {
        const userExistNotVerified = await this.userService.checkUserExists(
          email
        );

        if (!userExistNotVerified) {
          return {
            status: 404,
            res: {
              code: CR.notFound,
              message: "Login Failed, Invalid Login Credentials",
            },
          };
        }
        const sendOtp = await this.sendOtp(email);

       

        if (sendOtp.status === 200) {
          return {
            status: 200,
            res: {
              code: CR.successBut,
              data: {
                otp: sendOtp.res.data.otp,
                userId: sendOtp.res.data.userId,
                email: email,
              },
              message:
                "You are yet to verify email, an otp has been sent to your email",
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

  async sendOtp(email) {
    try {
      const otp = CU.generateOTP(6);
      const userExist = await this.userService.checkUserExists(email);

      if (userExist) {
        const updateUser = await this.userService.updateUser(userExist._id, {
          otp: otp,
        });

        //Send otp to email
        //Send an email to be implemented
        var html = verifyEmailTemp({ otp: otp });

        inlineCss(html, { url: "fake" }).then(function (htm) {
          html = htm;
        });

        this.notiService.sendEmail(email, "Verification Code", html);

        if (updateUser) {
          return {
            status: 200,
            res: {
              code: CR.success,
              message: "OTP Sent Successfully",
              data: {
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

  async changePassword(userId, oldPass, newPass) {
    try {
      const userExist = await this.authRepository.getAuth({ _id: userId });

      const passwordMatch = await bcrypt.compare(oldPass, userExist.password);
      if (!passwordMatch) {
        return {
          status: 400,
          res: {
            code: CR.badRequest,
            message: "Old Password Not Correct",
          },
        };
      }

      const saltR = 10;
      const hashPass = await bcrypt.hash(newPass, saltR);

      const newAuth = await this.updateAuth(userId, {
        password: hashPass,
      });

      if (newAuth) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Password Changed Successfully",
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
