const TimetableRepository = require("../repositories/timetableRepo");
const CR = require("../utils/customResponses");

class StoreService {
  constructor() {
    this.repo = new TimetableRepository();
  }

  async getByUserId(userId) {
    try {
      const cal = await this.repo.getByQuery({ owner: userId, active: true });

      const allMealInStore = [];
      const allMealInStoreCounts = new Map();

      const timetable = cal[0].timetable;

      for (let meal in timetable) {
        const curMeal = timetable[meal];
        let a = 0;
        while (a < curMeal.meals.length) {
          allMealInStore.push(curMeal.meals[a]);
          if (allMealInStoreCounts.has(curMeal.meals[a])) {
            // Object already exists in the map, increment the count
            const count = allMealInStoreCounts.get(curMeal.meals[a]);
            allMealInStoreCounts.set(curMeal.meals[a], count + 1);
          } else {
            // Object is encountered for the first time, set count to 1
            allMealInStoreCounts.set(curMeal.meals[a], 1);
          }
          a++;
        }
      }

      // console.log("All Meal", allMealInStoreCounts);

      const finalStore = [];

      allMealInStoreCounts.forEach((count, obj) => {
        const data = { mealItem: obj, count };

        finalStore.push(data);
      });

      if (cal) {
        return {
          status: 200,
          res: {
            code: CR.success,
            message: "Query Successful",
            data: finalStore,
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
      console.log("here:", error);
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

  async isActiveSub(userId) {
    const currentDate = new Date();
    const subInfo = await this.timetableRepo.getByQuery({
      owner: userId,
      endDate: {
        $gte: currentDate,
      },
    });
    return subInfo;
  }

  async isFreshUser(userId) {
    const recs = await this.timetableRepo.getByQuery({
      owner: userId,
    });
    return recs.length > 0 ? false : true;
  }
}

module.exports = StoreService;
