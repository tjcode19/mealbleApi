const request = require("supertest");
const app = require("../../app");

describe("Authentication", () => {
  it("should login", async () => {
    const login = {
      username: "tolu",
      password: "femi",
    };

    const response = await request(app).post("/auth").send(login).expect(200);

    // Assert the response body or any other expected behavior
    expect(response.body).toEqual({
      responseCode: "000",
      responseMessage: "Login Successful",
      // data: action[0],
    });
  });

  it("should return error if username is empty", async () => {
    const login = {
      username: "",
    };

    const response = await request(app).post("/auth").send(login).expect(400);

    // Assert the response body or any other expected behavior
    expect(response.body).toEqual({
      responseCode: "004",
      responseMessage: "Username field is required",
    });
  });

  it("should return error if username is null", async () => {
    const login = {
      username: null,
    };

    const response = await request(app).post("/auth").send(login).expect(400);

    // Assert the response body or any other expected behavior
    expect(response.body).toEqual({
      responseCode: "004",
      responseMessage: "Username field is required",
    });
  });
});
