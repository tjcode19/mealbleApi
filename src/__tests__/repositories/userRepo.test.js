// tests/repositories/userRepository.test.js

const UserRepository = require("../../repositories/userRepo");

describe("User Repository", () => {
  let userRepository;

  beforeEach(() => {
    // Set up any necessary test data or mocks
    userRepository = new UserRepository();
  });

  it("should create a new user in the database", async () => {
    const userData = {
      lastName: "Doe",
      firstName: "Doe",
      email: "john@example.com",
    };

    const newUser = await userRepository.createUser(userData);

    expect(newUser).toHaveProperty("_id");
    expect(newUser).toMatchObject(userData);
  });

  // it("should return an error if lastname is missing", async () => {
  //   const userData = { email: "john@example.com", firstName: "John Doe" };
  //   const newUser = await userRepository.createUser(userData);

  //   console.error(newUser, "how you dey");

  //   // Assert the error message or any other expected behavior
  //   expect(
  //     String(newUser).includes("lastName: Path `lastName` is required.")
  //   ).toBeTruthy();
  // });

  // it("should return an error if firstname is missing", async () => {
  //   const userData = { email: "john@example.com", lastName: "John Doe" };
  //   const newUser = await userRepository.createUser(userData);

  //   console.error(newUser, "how you dey");

  //   // Assert the error message or any other expected behavior
  //   expect(
  //     String(newUser).includes("firstName: Path `firstName` is required.")
  //   ).toBeTruthy();
  // });

  // Other repository test cases...
});
