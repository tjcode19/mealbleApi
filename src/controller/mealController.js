const MealService = require("../services/mealService");
const CR = require("../utils/customResponses");

class MealController {
  constructor() {
    this.oServices = new MealService();
  }

  async getAll(req, res) {
    try {
      const curs = await this.oServices.getAll();
      res.status(curs.status).json(curs.res);
    } catch (error) {
      console.log(error);
      res.json({
        code: CR.serverError,
        message: error,
        dev: "getAll Controller",
      });
    }
  }

  async getById(req, res) {
    try {
      const cur = await this.oServices.getById(req.params.id);
      res.status(cur.status).json(cur.res);
    } catch (error) {
      res.json({ code: CR.serverError, message: error });
    }
  }

  async create(req, res) {
    const data = req.body;

    try {
      if (data.name == null || data.name === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Name field is required",
        });
      }

      if (data.category == null || data.category.length === 0) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Select one or more category",
        });
      }
      const name = data.name.toLowerCase();
      const str = name.charAt(0).toUpperCase() + name.slice(1);

      const existM = await this.oServices.mealExist(str);
      if (existM) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Meal Already Exist",
        });
      }

      data.name = str;
      const cal = await this.oServices.createData(data);
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const cal = await this.oServices.updateData(req.params.id, req.body);
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }
  async delete(req, res) {
    try {
      const cal = await this.oServices.deleteData(req.params.id);
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }
}

module.exports = MealController;
