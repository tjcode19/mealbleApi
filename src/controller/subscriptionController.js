const SubscriptionService = require("../services/subscriptionService");
const CR = require("../utils/customResponses");

class SubscriptionController {
  constructor() {
    this.oServices = new SubscriptionService();
  }

  async getAll(req, res) {
    try {
      const { userId } = req.decoded;

      const curs = await this.oServices.getAll(userId);
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

  async getByRange(req, res) {
    try {
      const page = req.query.page || 1;
      const startDate = req.params.sDate;
      const endDate = req.params.eDate;
      const limit = req.query.limit || 10; // Number of items per page
      const offset = (page - 1) * limit; // Offset to skip the required number of items

      const curs = await this.oServices.getByTag(limit, offset, {
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
      });
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

      if (data.duration == null || data.duration === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Duration field is required",
        });
      }

      if (data.price == null || data.price === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Price field is required",
        });
      }

      const cal = await this.oServices.createData(data);
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }

  async verifyPurchase(req, res) {
    const {productId, purchaseToken} = req.body;

    try {
      if (productId == null || productId === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Product Id is required",
        });
      }

      if (purchaseToken == null || purchaseToken === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Purchase Token is required",
        });
      }

      console.log(productId, purchaseToken)
      

      const cal = await this.oServices.verifyPurchase(productId, purchaseToken);
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }

  async acknowledgePurchase(req, res) {
    const {productId, purchaseToken} = req.body;

    try {
      if (productId == null || productId === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Product Id is required",
        });
      }

      if (purchaseToken == null || purchaseToken === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Purchase Token is required",
        });
      }

      console.log(productId, purchaseToken)
      

      const cal = await this.oServices.acknowledgePurchase(productId, purchaseToken);
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

module.exports = SubscriptionController;
