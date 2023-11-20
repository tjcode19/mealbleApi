const NotificationService = require("../services/notificationService");
const CR = require("../utils/customResponses");

class NotificationController {
  constructor() {
    this.oServices = new NotificationService();
  }

  async createMessage(req, res) {

    const { title, message, owner, category } = req.body;
    try {
      
      const curs = await this.oServices.createMessage({
        title,
        message,
        owner,
        category,
        date: new Date(),
      });
      res.status(curs.status).json(curs.res);
    } catch (error) {}
  }

  async getAll(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 100; // Number of items per page
      const offset = (page - 1) * limit; // Offset to skip the required number of items

      const curs = await this.oServices.getAllMessages(limit, offset);
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
    const { userId } = req.decoded;
    try {
      const curs = await this.oServices.getMessageByQuery({
        $or: [{ owner: userId }, { owner: "All" }],
        owner: {
          $gte: currentDate,
        },
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

  async getTips(req, res) {
    try {
      const curs = await this.oServices.getMessageByQuery({
        category: "Tips",
      });
      res.status(curs.status).json(curs.res);
    } catch (error) {
      console.log(error);
      res.json({
        code: CR.serverError,
        message: error,
        dev: "get Notifcation Tips Controller",
      });
    }
  }

  async getNotifications(req, res) {
    try {
      const curs = await this.oServices.getMessageByQuery({
        category: {
          $ne: "Tips",
        },
      });
      res.status(curs.status).json(curs.res);
    } catch (error) {
      console.log(error);
      res.json({
        code: CR.serverError,
        message: error,
        dev: "get Non-Tips Controller",
      });
    }
  }

  async getByCategory(req, res) {
    try {
      const cur = await this.oServices.getById(req.params.id);
      res.status(cur.status).json(cur.res);
    } catch (error) {
      res.json({ code: CR.serverError, message: error });
    }
  }

  async sendPush(req, res) {
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
