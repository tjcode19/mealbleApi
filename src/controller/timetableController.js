const TimetableService = require("../services/timetableService");
const SubService = require("../services/subscriptionService");
const CR = require("../utils/customResponses");

class TimetableController {
  constructor() {
    this.oServices = new TimetableService();
    this.subService = new SubService();
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
      const { userId } = req.decoded;
      const cur = await this.oServices.getUserRecords({
        owner: userId,
      });
      res.status(cur.status).json(cur.res);
    } catch (error) {
      res.json({ code: CR.serverError, message: error });
    }
  }

  async create(req, res) {
    // const data = req.body;

    const { userId } = req.decoded;
    const { subId, type, token } = req.params;
    try {
      if (subId == null || subId === "") {
        return res
          .status(400)
          .json({ code: CR.badRequest, message: "SubId missing from the URL" });
      }

      if (type == null || type === "") {
        return res
          .status(400)
          .json({ code: CR.badRequest, message: "Sub Type missing from the URL" });
      }
      const isValidSub = await this.subService.getById(subId);

      if (isValidSub.status !== 200) {
        return res
          .status(400)
          .json({ code: CR.badRequest, message: "Invalid Subscription ID" });
      }
      let dur, shuffle, regenerate;
      const t = isValidSub.res.data.period;

      if (type == "WK") {
        dur = t.week.duration;
        shuffle = t.week.shuffle;
        regenerate = t.week.regenerate;
      } else {
        dur = t.month.duration;
        shuffle = t.month.shuffle;
        regenerate = t.month.regenerate;
      }

      const cal = await this.oServices.createData(
        userId,
        subId,
        dur,
        shuffle,
        regenerate,
        purchaseToken=token
      );
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }

  async shuffle(req, res) {
    try {
      const cal = await this.oServices.shuffle(req.params.id);
      res.status(cal.status).json(cal.res);
    } catch (error) {
      res.status(500).json({ code: CR.serverError, message: error.message });
    }
  }

  async regenerate(req, res) {
    try {
      const cal = await this.oServices.regenerate(req.params.id);
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
