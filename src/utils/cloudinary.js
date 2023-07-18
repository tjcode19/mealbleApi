const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'db1ipfcji',
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET
});

module.exports = cloudinary;