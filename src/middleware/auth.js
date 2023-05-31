// middleware.js
const jwt = require("jsonwebtoken");
// const logger = require("../services/logger");
const CR = require("../utils/customResponses");

function isAdmin(req, res, next) {
  const check = checkToken(req);

  if (check) {
    req.decoded = check;

    if (req.decoded.role === "Admin") {
      next();
    } else {
      res
        .status(401)
        .json({ code: CR.unathorised, message: "Unauthorized access" });
    }
  } else {
    return res
      .status(400)
      .json({ code: CR.badRequest, message: "Invalid Token" });
  }
}

async function checkToken(req) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
      return decoded;
    } catch (error) {
      return null;
    }
  } else {
    return null;
  }
}

async function authenticate(req, res, next) {
  const check = await checkToken(req);

  if (check) {
    req.decoded = check;
    next();
  } else {
    return res
      .status(401)
      .json({ code: CR.unathorised, message: "Invalid Token" });
  }
}

function userType(arg) {
  return function (req, res, next) {
    req.type = arg;
    next();
  };
}

module.exports = {
  isAdmin,
  authenticate,
  userType,
};
