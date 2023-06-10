const TimetableService = require("../services/timetableService");
const CR = require("../utils/customResponses");

class TimetableController {
  constructor() {
    this.oServices = new TimetableService();
  }

  async getAll(req, res) {
    try {
      const page = req.query.page || 1;
      const type = req.query.type; // Current page number
      const limit = req.query.limit || 10; // Number of items per page
      const offset = (page - 1) * limit; // Offset to skip the required number of items

      const curs = await this.oServices.getAll(limit, offset, type);
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

  async getActiveTimetable(req, res) {
    try {
      const userId = req.params.id;
      const cur = await this.oServices.getActiveTimetable({
        owner: userId,
        active: true,
      });
      res.status(cur.status).json(cur.res);
    } catch (error) {
      res.json({ code: CR.serverError, message: error });
    }
  }

  async getUserRecords(req, res) {
    try {
      const userId = req.params.id;
      const cur = await this.oServices.getUserRecords({
        owner: userId,
      });
      res.status(cur.status).json(cur.res);
    } catch (error) {
      res.json({ code: CR.serverError, message: error });
    }
  }

  async create(req, res) {
    const data = req.body;
    try {
      const cal = await this.oServices.createData("64787ec50495ab4d35a5a7de");
      res.status(cal.status).json(cal.res);
    } catch (error) {
      console.log("wait oooo", error);
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }

  async shuffle(req, res) {
    try {
      const cal = await this.oServices.reshuffle(req.params.id);
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

module.exports = TimetableController;
