// const currencyService = require("../services/currency");

module.exports = mealController = {
  getAll: async (req, res, next) => {
    try {
      //   const curs = await currencyService.getAll();
      res.status(200).json({
        responseCode: "000",
        responseMessage: "Query Successful",
        // data: curs,
      });
    } catch (error) {
      next(error);
      res.json({ responseCode: "0036", msg: error.message });
    }
  },
  getById: async (req, res, next) => {
    try {
      //   const cur = await currencyService.getById(req.params.id);
      res.json({
        responseCode: "000",
        responseMessage: "Query Successful",
        data: cur,
      });
    } catch (error) {
      next(error);
      res.json({ responseCode: "0036", msg: error.message });
    }
  },
  create: async (req, res, next) => {
    const { name, description } = req.body;

    try {
      if (name == null || name === "") {
        return res.status(400).json({
          responseCode: "004",
          responseMessage: "Name field is required",
        });
      }

      res.status(201).json({
        responseCode: "000",
        responseMessage: "Currency Added Successful",
        // data: action[0],
      });
    } catch (error) {
      next(error);
      return { err: error };
    }
  },

  update: async (req, res, next) => {
    try {
      //   const user = await currencyService.update(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      //   const user = await currencyService.delete(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
};
