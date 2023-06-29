const StoreService = require("../services/storeService");
const CR = require("../utils/customResponses");

class StoreController {
  constructor() {
    this.oServices = new StoreService();
  }

  async getAll(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10; // Number of items per page
      const offset = (page - 1) * limit; // Offset to skip the required number of items

      const curs = await this.oServices.getAll(limit, offset);
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

  async getByTag(req, res) {
    try {
      const page = req.query.page || 1;
      const type = req.params.tag; // Current page number
      const limit = req.query.limit || 10; // Number of items per page
      const offset = (page - 1) * limit; // Offset to skip the required number of items

      const curs = await this.oServices.getByTag(limit, offset, type);
      res.status(curs.status).json(curs.res);
    } catch (error) {
      console.log(error);
      res.json({
        code: CR.serverError,
        message: error,
        dev: "getByTag Controller",
      });
    }
  }

  async getByUserId(req, res) {
    
    const { userId } = req.decoded;

    try {
      const cur = await this.oServices.getByUserId(userId);
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

module.exports = StoreController;
