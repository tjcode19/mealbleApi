const request = require("supertest");
const app = require("../../app");
require("dotenv/config");

describe("The meal route", () => {
  it("should add a new food to the meal timetable", async () => {
    const newFood = {
      name: "Chicken Curry",
      description: "Delicious chicken curry with rice",
    };

    const response = await request(app).post("/meal").send(newFood).expect(201);

    // Assert the response body or any other expected behavior
    expect(response.body).toEqual({
      responseCode: "000",
      responseMessage: "Currency Added Successful",
      // data: action[0],
    });
  });

  it("should return an error if required fields are missing", async () => {
    const invalidFood = {
      description: "Delicious chicken curry with rice",
    };

    const response = await request(app)
      .post("/meal")
      .send(invalidFood)
      .expect(400);

    // Assert the error message or any other expected behavior
    expect(response.body).toEqual({
      responseCode: "004",
      responseMessage: "Name field is required",
    });
  });

  it("should return list of meals", async () => {
    const response = await request(app).get("/meal").expect(200);

    // Assert the error message or any other expected behavior
    expect(response.body).toEqual({
      responseCode: "000",
      responseMessage: "Query Successful",
    });
  });
});
