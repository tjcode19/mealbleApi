const MealRepository = require("../repositories/mealRepo");
const CR = require("../utils/customResponses");
const cloudinary = require("../utils/cloudinary").v2;

class MealService {
  constructor() {
    this.repo = new MealRepository();
  }

  async createData(data) {
    try {
      const cal = await this.repo.createData(data);
      if (cal) {
        return {
          status: 201,
          res: {
            code: CR.success,
            message: "Meal Added Successfully",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }

      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async getAll(limit, offset) {
    try {
      const cal = await this.repo.getAll(limit, offset);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }

      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async getByTag(limit, offset, type) {
    try {
      const cal = await this.repo.getByTag(limit, offset, type);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }

      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetByTag MealService",
        },
      };
    }
  }

  async getById(id) {
    try {
      const cal = await this.repo.getById(id);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In Get BY ID MealService",
        },
      };
    }
  }

  async mealExist(name) {
    try {
      const cal = await this.repo.getByQuery({ name: name });
      if (cal) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async mealSearch(name) {
    try {
      const lowerCaseName = name.toLowerCase();
      const nameRegex = new RegExp(lowerCaseName, "i");

      const cal = await this.repo.getByQuery2({
        $or: [
          { name: nameRegex }, // Search by name
          { extra: { $regex: nameRegex } }, // Check if the "extra" array contains the name provided
        ],
      });

      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async updateData(id, data) {
    try {
      const cal = await this.repo.updateData(id, data);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Update Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async deleteData(id) {
    try {
      const cal = await this.repo.deleteData(id);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Delete Successful",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In GetAll MealService",
        },
      };
    }
  }

  async uploadImage(id, file) {
    try {
      let errM = false;

      const upload = await cloudinary.uploader.upload(file.path);

      let res;

      if (!upload) {
        res = {
          status: 400,
          res: {
            code: CR.notFound,
            message: "Error while uploading the file",
          },
        };
      }
      const cal = await this.repo.updateData(id, {
        imageUrl: upload.secure_url,
      });

      if (cal)
        res = {
          status: 200,
          res: {
            code: CR.success,
            message: "Upload Successful",
          },
        };
      else
        res = {
          status: 400,
          res: {
            code: CR.badRequest,
            message: "Upload Failed",
          },
        };
      return res;
    } catch (error) {
      if (String(error).includes("MongoNotConnectedError")) {
        return {
          status: 500,
          res: { code: CR.serverError, message: "Database connection error" },
        };
      }
      return {
        status: 500,
        res: {
          code: CR.serverError,
          message: "Internal server error:" + error,
          dev: "In UploadImage MealService",
        },
      };
    }
  }
}

module.exports = MealService;
