const request = require("supertest");
const app = require("../app");

const mongoose = require("mongoose");


describe("Database Connection", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // afterAll(async () => {
  //   await mongoose.connection.close();
  // });

  it("should connect to the database", () => {
    expect(mongoose.connection.readyState).toEqual(2);
  });

  it("should handle database connection errors", async () => {
    // Disconnect from the database to simulate a connection error
    await mongoose.disconnect();

    const res = await request(app).get("/user");

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty("message", "Database connection error");

    // Reconnect to the database after the test
    await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Rest of your test cases...
});
