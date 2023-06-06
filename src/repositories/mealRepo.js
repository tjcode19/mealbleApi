const Meal = require("../models/Meal");

class MealRepository {
  async createData(data) {
    return await Meal.create(data);
  }

  async getAll() {
    return await Meal.find().lean().sort({ _id: -1 });
  }

  async getById(id) {
    return await Meal.findById(id);
  }

  async getByQuery(q) {
    console.log(q);
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

module.exports = MealRepository;
