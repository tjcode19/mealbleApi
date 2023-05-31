// src/services/userService.js

const MealRepository = require('../repositories/userRepo');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData) {
    return await this.userRepository.createUser(userData);
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
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
}

module.exports = UserService;
