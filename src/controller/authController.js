// const currencyService = require("../services/currency");

module.exports = authController = {
  login: async (req, res, next) => {
    const { username, password } = req.body;

    try {
      if (username == null || username === "") {
        return res.status(400).json({
          responseCode: "004",
          responseMessage: "Username field is required",
        });
      }

      

      if (password == null || password === "") {
        return res.status(400).json({
          responseCode: "004",
          responseMessage: "Password field is required",
        });
      }

      res.status(200).json({
        responseCode: "000",
        responseMessage: "Login Successful",
      });
    } catch (error) {
      next(error);
      return { err: error };
    }
  },
};
