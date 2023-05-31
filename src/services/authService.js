// src/services/userService.js

const AuthRepository = require("../repositories/authRepo");

class UserService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  async createAuth(userData) {
    return await this.authRepository.createAuth(userData);
  }

  async login(email, password) {
    return await this.authRepository.login(email, password);
  }

  async updateUser(userId, userData) {
    return await this.authRepository.updateAuth(userId, userData);
  }

  async deleteAuth(userId) {
    return await this.authRepository.deleteAuth(userId);
  }
}

module.exports = UserService;
