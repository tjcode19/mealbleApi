const NotificationService = require("../services/notificationService");
const CR = require("../utils/customResponses");

class NotificationController {
  constructor() {
    this.oServices = new NotificationService();
  }

  async getAll(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 100; // Number of items per page
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

  async getByUser(req, res) {
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

  async getById(req, res) {
    try {
      const cur = await this.oServices.getById(req.params.id);
      res.status(cur.status).json(cur.res);
    } catch (error) {
      res.json({ code: CR.serverError, message: error });
    }
  }

  async sendMessage(req, res) {
    const data = req.body;

    try {
      if (data.title == null || data.title === "") {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Title field is required",
        });
      }

      if (data.body == null || data.body === 0) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Body field is required",
        });
      }

      const cal = await this.oServices.sendPushNotification(
        data.token,
        data.topic,
        data.title,
        data.body,
        { name: data.name }
      );
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }

  async sendEmail(req, res) {
    const data = req.body;

    try {
      // if (data.title == null || data.title === "") {
      //   return res.status(400).json({
      //     code: CR.badRequest,
      //     message: "Title field is required",
      //   });
      // }

      // if (data.body == null || data.body === 0) {
      //   return res.status(400).json({
      //     code: CR.badRequest,
      //     message: "Body field is required",
      //   });
      // }

      const cal = await this.oServices.sendEmail();
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

  async uploadFile(req, res) {
    try {
      const image = req.file;
      const id = req.body.id;

      if (!image) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "No file uploaded",
        });
      }

      const cal = await this.oServices.uploadImage(id, image);
      res.status(cal.status).json(cal.res);
    } catch (error) {}
  }
}

module.exports = NotificationController;
