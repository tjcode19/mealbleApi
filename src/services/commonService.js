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

  async isFreshUser(userId) {
    const recs = await this.timetableRepo.getByQuery({
      owner: userId,
    });
    return recs.length > 0 ? false : true;
  }
}

module.exports = CommonService;
