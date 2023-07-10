const MealRepository = require("../repositories/mealRepo");
const CR = require("../utils/customResponses");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

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

      console.log(cal, "here");
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

      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      const newName = "m_" + id + path.extname(file.originalname);
      // const newPath = path.join(__dirname, "uploads", newName);

      // Create the file path based on your API URL structure
      const apiURL = process.env.BASE_URL;
      const filePath = `upload/${newName}`;
      const fileURL = `${apiURL}${filePath}`;

      // Rename and move the uploaded file to the 'uploads' directory
      const newPath = path.join(__dirname, "../uploads", newName);

      // Resize the image to specific dimensions
      try {
        await sharp(file.path)
          .resize({ width: 600, height: 400 }) // Set the desired width and height
          .toFile(newPath);
      } catch (err) {
        // console.error("Error while resizing the image:", err);
        res.status(500).send("Error while resizing the image");
        errM = true;
        return;
      }

      // // Check if the file already exists
      // if (fs.existsSync(newPath)) {
      //   // File already exists, delete it
      //   fs.unlinkSync(newPath);
      // }
      // let res;

      // let errM = false;

      // fs.rename(file.path, newPath, (err) => {
      //   if (err) {
      //     console.error(err);
      //     errM = true;
      //   } else {
      //     // res.send("File uploaded successfully");
      //     errM = false;
      //   }
      // });

      let res;

      if (errM) {
        res = {
          status: 400,
          res: {
            code: CR.notFound,
            message: "Error while saving the file",
          },
        };
      }
      const cal = await this.repo.updateData(id, { imageUrl: fileURL });

      res = {
        status: 200,
        res: {
          code: CR.success,
          message: "Upload Successful",
          data: fileURL,
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
          dev: "In GetAll MealService",
        },
      };
    }
  }
}

module.exports = MealService;
