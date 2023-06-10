const Timetable = require("../models/Timetable");

class TimetableRepository {
  async createData(data) {
    return await Timetable.create(data);
  }

  async getAll(limit, offset) {
    return await Timetable.find()
      .lean()
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)
      .populate("timetable.meals.meal");
  }

  async getById(id) {
    return await Timetable.findById(id)
      .lean()
      .sort({ _id: -1 })
      .populate("timetable.meals.meal");
  }

  async getByTag(limit, offset, query) {
    try {
      return await Timetable.find()
        .lean()
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit);
    } catch (error) {
      console.log(error);
    }
  }

  async getByQuery(q) {
    try {
      return await Timetable.find(q)
        .lean()
        .sort({ _id: -1 })
        .populate("timetable.meals.meal");
    } catch (error) {
      console.log(error);
    }
  }

  async updateData(id, data) {
    return await Timetable.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteData(id) {
    return await Timetable.findByIdAndDelete(id);
  }
}

module.exports = TimetableRepository;
