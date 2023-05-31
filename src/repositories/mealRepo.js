const User = require("../models/Users");


class UserRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async getAllUsers() {
    return await User.find().lean().populate("auth");
  }

  async getUserById(userId) {
    return await User.findById(userId);
  }

  async updateUser(userId, userData) {
    return await User.findByIdAndUpdate(userId, userData, { new: true });
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = UserRepository;

