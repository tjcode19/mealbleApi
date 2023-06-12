const MealRepository = require("../repositories/mealRepo");
const TimetableRepository = require("../repositories/timetableRepo");
const UserRepository = require("../repositories/userRepo");
const CR = require("../utils/customResponses");
const CU = require("../utils/utils");

const mealService = require("../services/mealService");

class TimetableService {
  constructor() {
    this.repo = new TimetableRepository();
    this.mRepo = new MealRepository();
    this.uRepo = new UserRepository();
    this.lastAssignedDays;
  }

  async createData(userId, subId, duration) {
    try {
      const startDate = new Date(); // Set your desired start date here
      const endDate = new Date(startDate);
      const dur = duration || 7;
      endDate.setDate(startDate.getDate() + dur);

      const timetable = await this.generateMealTimetable(dur);
      const timetableData = {
        owner: userId, // The ID of the user associated with the timetable
        startDate: startDate, // The start date of the timetable
        endDate: endDate,
        sub: subId, // The end date of the timetable
        timetable: timetable, // The generated timetable array
      };

      const cal = await this.repo.createData(timetableData);
      if (cal) {
        const sb = { expiryDate: endDate, sub: subId };
        this.uRepo.updateUser(userId, { subInfo: sb });
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

  async reshuffle(id) {
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

      const timetable = await this.generateMealTimetable(cal.startDate);

      if (timetable) {
        const a = await this.updateData(id, { timetable: timetable });
        if (!a) {
          return {
            status: 200,
            res: {
              code: CR.success,
              message: "Operation Failed",
              data: reshuffledTimetable,
            },
          };
        }
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Timetable Reshiffled Successfully",
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

  days(lastAssignDate, currentDate) {
    let difference = lastAssignDate.getTime() - currentDate.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
  }

  // Assuming you have the necessary setup to connect to MongoDB and the Timetable model is already imported

  // Generate a meal timetable for the given number of days
  generateMealTimetable = async (numDays) => {
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
      SN: [],
    };

    try {
      // Step 1: Retrieve all recipes from the database
      const recipes = await this.mRepo.getAll(100, 1);

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

      // const currentDate = new Date(startDate);
      //   currentDate.setDate(startDate.getDate() + i);
      //   const currentDay = daysOfWeek[currentDate.getDay()];

      for (let i = 0; i < numDays; i++) {
        const currentDate = new Date();
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
              lastAssignment <= currentDate - 2 * 24 * 60 * 60 * 1000
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

      console.log("Generated Meal Timetable:");
      console.log(timetable);
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

  // Generate a meal timetable for one week
  // async generateMealTimetable(startDate, duration) {
  //   const daysOfWeek = [
  //     "Sunday",
  //     "Monday",
  //     "Tuesday",
  //     "Wednesday",
  //     "Thursday",
  //     "Friday",
  //     "Saturday",
  //   ];
  //   const timetable = [];
  //   const categoryMeals = {};

  //   try {
  //     // Fetch all recipes from the database
  //     const recipes = await this.mRepo.getAll(100, 1);

  //     // Group recipes by category
  //     recipes.forEach((recipe) => {
  //       recipe.category.forEach((category) => {
  //         if (!categoryMeals[category]) {
  //           categoryMeals[category] = [];
  //         }
  //         categoryMeals[category].push(recipe);
  //       });
  //     });

  //     // Generate meals for each day of the week
  //     for (let i = 0; i < duration; i++) {
  //       const currentDate = new Date(startDate);
  //       currentDate.setDate(startDate.getDate() + i);
  //       const currentDay = daysOfWeek[currentDate.getDay()];

  //       const meals = [];
  //       const nutrientsCount = {};
  //       const lastAssignmentMap = new Map();

  //       // Generate meals for each category
  //       for (const category in categoryMeals) {
  //         const availableMeals = categoryMeals[category];

  //         let selectedMeal = null;
  //         let retries = 0;

  //         // Attempt to select a meal that hasn't been assigned yet or hasn't been assigned in the last 4 days
  //         while (!selectedMeal && retries < 50) {
  //           const randomIndex = Math.floor(
  //             Math.random() * availableMeals.length
  //           );

  //           const mealToCheck = availableMeals[randomIndex];

  //           const lastAssignmentDate = lastAssignmentMap.get(mealToCheck._id); // Get last assignment date from the map

  //           console.log("CurrentDate:", currentDate);
  //           // console.log("LastAssigned:", lastAssignmentDate);

  //           if (lastAssignmentDate) {
  //             console.log("LastAssigned:", lastAssignmentDate);
  //             const d = this.days(lastAssignmentDate, currentDate);
  //             console.log("Calculated", d);

  //             break;
  //           }

  //           console.log("What is next");

  //           if (
  //             (!lastAssignmentDate ||
  //               lastAssignmentDate < currentDate - 4 * 24 * 60 * 60 * 1000) &&
  //             this.meetsNutrientRequirements(mealToCheck, nutrientsCount)
  //           ) {
  //             selectedMeal = mealToCheck;
  //             lastAssignmentMap.set(mealToCheck._id, currentDate); // Update the last assignment date in the map
  //             this.updateNutrientCount(mealToCheck, nutrientsCount);
  //           }

  //           retries++;
  //         }

  //         // Add the selected meal to the meals array for the current day
  //         meals.push({
  //           date: currentDate,
  //           category: category,
  //           meal: selectedMeal,
  //         });

  //         // console.log("Selected Meal", selectedMeal);
  //       }

  //       // Add the meals for the current day to the timetable
  //       timetable.push({
  //         day: currentDay,
  //         meals: meals,
  //       });
  //     }

  //     return timetable;
  //   } catch (error) {
  //     console.error("Error generating meal timetable:", error);
  //   }
  // }

  // // Function to check if a meal meets nutrient requirements
  // meetsNutrientRequirements(meal, nutrientsCount) {
  //   for (const nutrient of meal.nutrients) {
  //     if (!nutrientsCount[nutrient]) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // // Function to update nutrient count after selecting a meal
  // updateNutrientCount(meal, nutrientsCount) {
  //   for (const nutrient of meal.nutrients) {
  //     if (nutrientsCount[nutrient]) {
  //       nutrientsCount[nutrient]++;
  //     } else {
  //       nutrientsCount[nutrient] = 1;
  //     }
  //   }
  // }

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
