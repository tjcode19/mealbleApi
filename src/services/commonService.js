const TimetableRepository = require("../repositories/timetableRepo");

class CommonService {
  constructor() {
    this.timetableRepo = new TimetableRepository();
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
}

module.exports = CommonService;
