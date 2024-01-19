const request = require("supertest");
const express = require("express");
const registrationRouter = require("../routes/register");

const app = express();
app.use(express.json());
app.use("/register", registrationRouter);

describe("Registration Route", () => {
  it("should register a new user", async () => {
    const userData = {
      email: "test@example.com",
      password: "testpassword123",
    };

    const response = await request(app).post("/register").send(userData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });

  it("should handle invalid input data", async () => {
    const invalidUserData = {
      email: "invalid-email",
      password: "short",
    };

    const response = await request(app).post("/register").send(invalidUserData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Invalid input. Please check your data",
    );
    expect(response.body).toHaveProperty("errors");
  });

  // Add more test cases as needed
});
