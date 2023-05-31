// src/controllers/userController.js

const UserService = require("../services/userService");
const CR = require("../utils/customResponses");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async createUser(req, res) {
    try {
      const userData = req.body;

      // Input validation in the controller
      if (!userData.email) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Valid email is required",
        });
      }

      // Check for a valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({
          code: CR.badRequest,
          message: "Invalid email format",
        });
      }

      // Check if the user already exists
      const userExists = await this.userService.checkUserExists(userData.email);
      if (userExists) {
        return res
          .status(409)
          .json({ code: CR.existingData, message: "User already exists" });
      }

      const newUser = await this.userService.createUser(userData);
      res.status(201).json({
        code: CR.success,
        message: "Request Successful",
        data: newUser,
      });
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }

  async getAllUsers(req, res) {
    try {
      const page = req.query.page || 1; // Current page number
      const limit = req.query.limit || 10; // Number of items per page
      const offset = (page - 1) * limit; // Offset to skip the required number of items

      const users = await this.userService.getAllUsers(limit, offset);
      if (users) {
        res.status(201).json({
          code: CR.success,
          message: "Request Successful",
          data: users,
        });
      } else {
        res.status(404).json({ code: CR.notFound, message: "User not found" });
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return res
          .status(500)
          .json({ code: CR.serverError, message: "Database connection error" });
      }
      res
        .status(500)
        .json({ code: CR.serverError, message: "Internal server error" });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const userData = req.body;
      const updatedUser = await this.userService.updateUser(userId, userData);
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const deletedUser = await this.userService.deleteUser(userId);
      if (deletedUser) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = UserController;
