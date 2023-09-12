const Notification = require("../models/CustomNotifications");

class NotificationRepository {
  async createData(data) {
    return await Notification.create(data);
  }

  async getAll(limit, offset) {
    return await Notification.find()
      .lean()
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit);
  }

  async getByQuery(q) {
    try {
      return await Notification.find(q);
    } catch (error) {
      console.log(error);
    }
  }

  async updateData(id, data) {
    return await Notification.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteData(id) {
    return await Notification.findByIdAndDelete(id);
  }
}

module.exports = NotificationRepository;
