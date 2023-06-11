const User = require("../models/Users");

class UserRepository {
  async createUser(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      return error;
    }
  }

  async getAllUsers(limit, offset) {
    return await User.find().sort({ _id: -1 }).skip(offset).limit(limit).lean().populate("auth");
  }

  async getUserById(userId) {
    return await User.findById(userId).populate("sub");
  }

  async getUserByQuery(query) {
    return await User.findOne(query);
  }

  async updateUser(userId, userData) {
    return await User.findByIdAndUpdate(userId, userData, { new: true });
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = UserRepository;
