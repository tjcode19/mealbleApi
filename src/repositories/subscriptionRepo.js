const Subscription = require("../models/Subcription");

class SubscriptionRepository {
  async createData(data) {
    return await Subscription.create(data);
  }

  async getAll(limit, offset) {
    return await Subscription.find().lean().sort({ _id: -1 }).skip(offset).limit(limit).populate('subscription.meals.meal');
  }

  async getById(id) {
    return await Subscription.findById(id);
  }

  async getByTag(limit, offset, query) {
    try {
      return await Subscription.find().lean().sort({ _id: -1 }).skip(offset).limit(limit);
    } catch (error) {
      console.log(error);
    }
  }

  async getByQuery(q) {
    try {
      return await Subscription.findOne(q);
    } catch (error) {
      console.log(error);
    }
  }

  async updateData(id, data) {
    return await Subscription.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteData(id) {
    return await Subscription.findByIdAndDelete(id);
  }
}

module.exports = SubscriptionRepository;
