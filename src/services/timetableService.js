const MealRepository = require("../repositories/mealRepo");
const TimetableRepository = require("../repositories/timetableRepo");
const UserRepository = require("../repositories/userRepo");
const SchedulerService = require("../services/schedulerService");
const CR = require("../utils/customResponses");
const CU = require("../utils/utils");

const mealService = require("../services/mealService");

class TimetableService {
  constructor() {
    this.scheduler = new SchedulerService();
    this.repo = new TimetableRepository();
    this.mRepo = new MealRepository();
    this.uRepo = new UserRepository();
    this.lastAssignedDays;
  }

  async createData(userId, subId, duration, shuffle, regenerate) {
    try {
      const startDate = new Date(); // Set your desired start date here
      const endDate = new Date(startDate);
      const dur = duration || 3;
      endDate.setDate(startDate.getDate() + parseInt(dur));

      const how = await this.scheduler.checkSubscriptionStatus();

      console.log(how);
      const repo1 = new TimetableRepository();

      const tTable = await repo1.getByQuery({
        owner: userId,
        active: true,
      });

      if (tTable.length > 0) {
        return {
          status: 400,
          res: {
            code: CR.badRequest,
            message: "You still have an active subscription",
          },
        };
      }
      // Step 1: Retrieve all recipes from the database
      const recipes = await this.mRepo.getAll(100, 1);

      const timetable = await this.generateMealTimetable(
        dur,
        startDate,
        recipes
      );
      const timetableData = {
        owner: userId, // The ID of the user associated with the timetable
        startDate: startDate, // The start date of the timetable
        endDate: endDate,
        subData: { period: dur, shuffle, regenerate },
        sub: subId, // The end date of the timetable
        timetable: timetable, // The generated timetable array
      };

      const cal = await this.repo.createData(timetableData);
      if (cal) {
        // const sb = { expiryDate: endDate, sub: subId };
        const freePlanId = "6482da425efe572f0274178a";
        if (subId === freePlanId) {
          this.uRepo.updateUser(userId, { usedFree: true });
        }

        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Timetable Generated Successfully",
            data: cal,
          },
        };
      } else {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "Unable to create timetable",
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
          dev: "In Create TimetableService",
        },
      };
    }
  }

  async regenerate(id) {
    try {
      const cal = await this.repo.getById(id);
      if (!cal) {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }

      if (cal.subData.regenerate < 1) {
        return {
          status: 400,
          res: {
            code: CR.badRequest,
            message: "Unsufficient Unit",
          },
        };
      }
      // Step 1: Retrieve all recipes from the database
      const recipes = await this.mRepo.getAll(100, 1);

      const timetable = await this.generateMealTimetable(
        cal.subData.period,
        cal.startDate,
        recipes
      );

      if (timetable) {
        const a = await this.updateData(id, {
          timetable: timetable,
          $set: { "subData.regenerate": cal.subData.regenerate - 1 },
        });
        if (!a) {
          return {
            status: 500,
            res: {
              code: CR.success,
              message: "Operation Failed",
            },
          };
        }
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Timetable Regenerated Successfully",
            data: timetable,
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
          dev: "In Shuffle TimetableService",
        },
      };
    }
  }

  async shuffle(id) {
    try {
      const cal = await this.repo.getById(id);
      if (!cal) {
        return {
          status: 404,
          res: {
            code: CR.notFound,
            message: "No Record Found",
          },
        };
      }

      if (cal.subData.shuffle < 1) {
        return {
          status: 400,
          res: {
            code: CR.badRequest,
            message: "Unsufficient Unit",
          },
        };
      }

      //shuffle timetable
      const recipes = [];

      for (const key in cal.timetable) {
        if (Object.hasOwnProperty.call(cal.timetable, key)) {
          const element = cal.timetable[key];
          element.meals.forEach((e) => {
            recipes.push(e.meal);
          });
        }
      }

      const timetable = await this.generateMealTimetable(
        cal.subData.period,
        cal.startDate,
        recipes
      );

      if (timetable) {
        const a = await this.updateData(id, {
          timetable: timetable,
          $set: { "subData.shuffle": cal.subData.shuffle - 1 },
        });
        if (!a) {
          return {
            status: 500,
            res: {
              code: CR.success,
              message: "Operation Failed",
              // data: reshuffledTimetable,
            },
          };
        }
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Timetable Shuffled Successfully",
            // data: timetable,
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
          dev: "In Shuffle TimetableService",
        },
      };
    }
  }

  days(lastAssignDate, currentDate) {
    let difference = lastAssignDate.getTime() - currentDate.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
  }

  // Generate a meal timetable for the given number of days
  generateMealTimetable = async (numDays, startDate, recipes) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const categoryMeals = {
      BR: [],
      LN: [],
      DN: [],
      FR: [],
    };

    try {
      // Step 2: Sort recipes based on category
      recipes.forEach((recipe) => {
        recipe.category.forEach((category) => {
          if (categoryMeals[category]) {
            categoryMeals[category].push(recipe);
          }
        });
      });

      // Step 3: Plan meals for each day providing the 4 categories
      const timetable = [];
      const lastAssignmentMap = new Map();

      for (let i = 0; i <= numDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const currentDay = daysOfWeek[currentDate.getDay()];
        const meals = [];

        for (const category in categoryMeals) {
          const availableMeals = categoryMeals[category];

          // Filter out recipes that have been assigned within the last 4 days
          const filteredMeals = availableMeals.filter((meal) => {
            const lastAssignment = lastAssignmentMap.get(meal._id);
            return (
              !lastAssignment ||
              lastAssignment <= currentDate - 4 * 24 * 60 * 60 * 1000
            );
          });

          // Shuffle the filtered meals for variety
          this.shuffleArray(filteredMeals);

          // Select the first meal that meets the nutrient requirements
          const selectedMeal = filteredMeals.find((meal) =>
            this.meetsNutrientRequirements(meal, meals)
          );

          if (selectedMeal) {
            meals.push({
              date: currentDate,
              category,
              meal: selectedMeal,
            });
            lastAssignmentMap.set(selectedMeal._id, currentDate);
          }
        }

        timetable.push({
          day: currentDay,
          meals,
        });
      }
      return timetable;
    } catch (error) {
      console.error("Error generating meal timetable:", error);
    }
  };

  // Function to check if a meal meets nutrient requirements
  meetsNutrientRequirements = (meal, selectedMeals) => {
    const nutrientsCount = {};
    selectedMeals.forEach((selectedMeal) => {
      selectedMeal.meal.nutrients.forEach((nutrient) => {
        if (nutrientsCount[nutrient]) {
          nutrientsCount[nutrient]++;
        } else {
          nutrientsCount[nutrient] = 1;
        }
      });
    });

    for (const nutrient of meal.nutrients) {
      if (!nutrientsCount[nutrient]) {
        return true;
      }
    }

    return false;
  };

  // Helper function to shuffle an array in place
  shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  async getAll(limit, offset, type) {
    try {
      const cal = await this.repo.getAll(limit, offset, type);
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

  async getByRange(limit, offset, query) {
    try {
      const cal = await this.repo.getByTag(limit, offset, query);
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

  async getUserRecords(q) {
    try {
      const cal = await this.repo.getByQuery(q);
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

  async getActiveTimetable(q) {
    try {
      const cal = await this.repo.getByQuery(q);
      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: cal[0],
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
}

module.exports = TimetableService;
