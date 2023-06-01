const Auth = require("../models/Auth");

class AuthRepository {
  async createAuth(userData) {
    try {
      return await Auth.create(userData);
    } catch (error) {
      return error;
    }
  }

  async login(email) {
    try {
      return await Auth.findOne({ username: email });
    } catch (error) {
      return error;
    }
  }

  async verifyEmail(userId) {
    return await Auth.findById(userId);
  }

  async resetPassword(query) {
    return await Auth.findOne(query);
  }

  async updateAuth(userId, userData) {
    return await Auth.findByIdAndUpdate(userId, userData, { new: true });
  }

  async deleteAuth(userId) {
    return await Auth.findByIdAndDelete(userId);
  }
}

module.exports = AuthRepository;
