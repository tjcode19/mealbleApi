const MealRepository = require("../repositories/mealRepo");
const TimetableRepository = require("../repositories/timetableRepo");
const CR = require("../utils/customResponses");
const mealService = require("../services/mealService");

class TimetableService {
  constructor() {
    this.repo = new TimetableRepository();
    this.mRepo = new MealRepository();
    this.lastAssignedDays;
  }

  async createData(userId) {
    try {
      // Retrieve all the recipes
      // const meal = await this.repo.getAll(100, 1);

      // // Define the meal categories
      // const categories = ["BR", "LN", "DN"];
      // // Define the number of days in the week and meals per day
      // const daysPerWeek = 7;
      // const mealsPerDay = categories.length;

      // // Generate a meal timetable for one week
      // const timetable = [];

      // // Track the last assigned day for each recipe
      // this.lastAssignedDays = {};

      // for (let i = 0; i < daysPerWeek; i++) {
      //   const dayMeals = [];

      //   const assignedRecipes = new Set(); // To track assigned recipes for the day

      //   for (let j = 0; j < mealsPerDay; j++) {
      //     const category = categories[j];
      //     let recipe;

      //     // Otherwise, find a recipe that has the current category tag and is not already assigned
      //     const categoryRecipes = meal.filter(
      //       (r) =>
      //         r.category.includes(category) &&
      //         !assignedRecipes.has(r._id) &&
      //         !this.isRecentlyAssigned(r._id, i)
      //     );

      //     recipe =
      //       categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)];

      //     while (recipe === []) {
      //       recipe =
      //         categoryRecipes[
      //           Math.floor(Math.random() * categoryRecipes.length)
      //         ];
      //     }

      //     console.log(recipe, "each recipe");

      //     // Add the recipe to the day's meals and mark it as assigned
      //     dayMeals.push(recipe);
      //     assignedRecipes.add(recipe._id);

      //     // Update the last assigned day for the recipe
      //     this.lastAssignedDays[recipe._id] = i;
      //   }

      //   timetable.push(dayMeals);
      // }

      const startDate = new Date(); // Set your desired start date here
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);

      const timetable = await this.generateMealTimetable(startDate);
      const timetableData = {
        owner: userId, // The ID of the user associated with the timetable
        startDate: startDate, // The start date of the timetable
        endDate: endDate, // The end date of the timetable
        timetable: timetable, // The generated timetable array
      };
      const cal = await this.repo.createData(timetableData);
      if (cal) {
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
          dev: "In Create TimetableService",
        },
      };
    }
  }

  // Helper function to check if a recipe was assigned within the last 3 days
  isRecentlyAssigned(recipeId, currentDay) {
    const lastAssignedDay = this.lastAssignedDays[recipeId];
    return lastAssignedDay !== undefined && currentDay - lastAssignedDay < 2;
  }

  // Assuming you have the necessary setup to connect to MongoDB and the Timetable model is already imported

  

  // Assuming you have the necessary setup to connect to MongoDB and the Timetable model is already imported

  // Generate a meal timetable for one week
  async generateMealTimetable(startDate) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const timetable = [];
    const categoryMeals = {};

    try {
      // Fetch all recipes from the database
      const recipes = await this.mRepo.getAll(100, 1);

      // Group recipes by category
      recipes.forEach((recipe) => {
        recipe.category.forEach((category) => {
          if (!categoryMeals[category]) {
            categoryMeals[category] = [];
          }
          categoryMeals[category].push(recipe);
        });
      });

      // Generate meals for each day of the week
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const currentDay = daysOfWeek[currentDate.getDay()];

        const meals = [];
        const nutrientsCount = {};
        const lastAssignmentMap = new Map();

        // Generate meals for each category
        for (const category in categoryMeals) {
          const availableMeals = categoryMeals[category];

          let selectedMeal = null;
          let retries = 0;

          // Attempt to select a meal that hasn't been assigned yet or hasn't been assigned in the last 4 days
          while (!selectedMeal && retries < 10) {
            const randomIndex = Math.floor(
              Math.random() * availableMeals.length
            );
            const mealToCheck = availableMeals[randomIndex];

            const lastAssignmentDate = lastAssignmentMap.get(mealToCheck._id); // Get last assignment date from the map

            if (
              (!lastAssignmentDate ||
                lastAssignmentDate < currentDate - 4 * 24 * 60 * 60 * 1000) &&
              this.meetsNutrientRequirements(mealToCheck, nutrientsCount)
            ) {
              selectedMeal = mealToCheck;
              lastAssignmentMap.set(mealToCheck._id, currentDate); // Update the last assignment date in the map
              this.updateNutrientCount(mealToCheck, nutrientsCount);
            }

            retries++;
          }

          // Add the selected meal to the meals array for the current day
          meals.push({
            date: currentDate,
            category: category,
            meal: selectedMeal,
          });
        }

        // Add the meals for the current day to the timetable
        timetable.push({
          day: currentDay,
          meals: meals,
        });
      }

      console.log("Generated Meal Timetable:");
      console.log(timetable);

      return timetable;
    } catch (error) {
      console.error("Error generating meal timetable:", error);
    }
  }

  // Function to check if a meal meets nutrient requirements
  meetsNutrientRequirements(meal, nutrientsCount) {
    for (const nutrient of meal.nutrients) {
      if (!nutrientsCount[nutrient]) {
        return true;
      }
    }
    return false;
  }

  // Function to update nutrient count after selecting a meal
  updateNutrientCount(meal, nutrientsCount) {
    for (const nutrient of meal.nutrients) {
      if (nutrientsCount[nutrient]) {
        nutrientsCount[nutrient]++;
      } else {
        nutrientsCount[nutrient] = 1;
      }
    }
  }

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
}

module.exports = TimetableService;
