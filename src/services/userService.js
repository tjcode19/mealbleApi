// src/services/userService.js

const UserRepository = require("../repositories/userRepo");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData) {
    return await this.userRepository.createUser(userData);
  }

  async getAllUsers(limit, offset) {
    return await this.userRepository.getAllUsers(limit, offset);
  }

  async getUserById(userId) {
    return await this.userRepository.getUserById(userId);
  }

  async updateUser(userId, userData) {
    return await this.userRepository.updateUser(userId, userData);
  }

  async deleteUser(userId) {
    return await this.userRepository.deleteUser(userId);
  }

  async checkUserExists(email) {
    return await this.userRepository.getUserByQuery({ email: email });
  }
}

module.exports = UserService;
