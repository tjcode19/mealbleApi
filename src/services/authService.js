// src/services/userService.js

const AuthRepository = require("../repositories/authRepo");

class UserService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  async createAuth(userData) {
    return await this.authRepository.createAuth(userData);
  }

  async login(email) {
    return await this.authRepository.login(email);
  }

  async updateAuth(userId, userData) {
    return await this.authRepository.updateAuth(userId, userData);
  }

  async deleteAuth(userId) {
    return await this.authRepository.deleteAuth(userId);
  }
}

module.exports = UserService;
