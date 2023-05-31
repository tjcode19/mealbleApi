const jwt = require("jsonwebtoken");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "key-yourkeyhere",
});

// const Products = require("../models/Product");

const validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const generateOTP = (n) => {
  var add = 1,
    max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
};

const generateSKU = async () => {
  const sku = "SKU_" + generateOTP(10);

  console.log(sku);

  const skuExist = await Products.findOne({ sku: sku }).lean();
  if (!skuExist) {
    return sku;
  } else {
    generateSKU();
  }
};

const generateAccessToken = function ({ userId, role, otp }) {
  return jwt.sign({ userId, role, otp }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const sendEmail = async ({ to, subject, htmlBody }) => {
  let messageParams = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: htmlBody,
  };
  const a = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageParams);

  if (a.status === 200) {
    return {
      code: "00",
    };
  } else {
    return {
      code: "01",
    };
  }
};

module.exports = {
  validateEmail,
  generateAccessToken,
  sendEmail,
  generateOTP,
  generateSKU,
};
