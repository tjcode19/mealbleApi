const cron = require("node-cron");
const TimetableRepository = require("../repositories/timetableRepo");

class SchedulerService {
  constructor() {
    this.tRepo = new TimetableRepository();
  }

  async checkSubscriptionStatus() {
    // Retrieve the subscription details from your data source (e.g., database)
    const currentDate = new Date();
    const subscription = await this.tRepo.getByQuery({
      endDate: {
        $lt: currentDate,
      },
      active: true,
    });

    if (subscription) {
      const self = this;
      subscription.forEach(function (data) {
        self.updateSub(data._id);
      });
    }
  }

  async updateSub(id) {
    this.tRepo.updateData(id, { active: false });
  }

  async startScheduler() {
    cron.schedule("0 */12 * * *", () => {
      console.log("running a task every minute");
      this.checkSubscriptionStatus();
    });
  }
}

module.exports = SchedulerService;
