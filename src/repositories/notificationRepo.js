const Notification = require("../models/Notification");

class NotificationRepository {
  async createData(data) {
    return await Meal.create(data);
  }

  async getAll(limit, offset) {
    return await Meal.find().lean().sort({ _id: -1 }).skip(offset).limit(limit);
  }

  async getById(id) {
    return await Meal.findById(id);
  }

  async getByTag(limit, offset, type) {
    try {
      return await Meal.find({ category: type }).lean().sort({ _id: -1 }).skip(offset).limit(limit);
    } catch (error) {
      console.log(error);
    }
  }

  async getByQuery(q) {
    try {
      return await Meal.findOne(q);
    } catch (error) {
      console.log(error);
    }
  }

  async updateData(id, data) {
    return await Meal.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteData(id) {
    return await Meal.findByIdAndDelete(id);
  }
}

module.exports = NotificationRepository;
