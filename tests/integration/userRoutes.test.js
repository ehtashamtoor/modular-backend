const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");

describe("User API Integration Tests", () => {
  let mongoServer;

  // start an in-memory MongoDB instance at the start of the test suite
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // close the DB connection and stop MongoMemoryServer after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // optionally clear the database, after each test
  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  it("should create a new user", async () => {
    const userData = {
      name: "Integration Test User",
      email: "integration@example.com",
      password: "password123",
    };

    const res = await request(app)
      .post("/api/users")
      .send(userData)
      .expect(201);

    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.name).toBe(userData.name);
    expect(res.body.data.email).toBe(userData.email);
  });

  it("should retrieve all users", async () => {
    // First, create a user
    const userData = {
      name: "Integration Test User",
      email: "integration@example.com",
      password: "password123",
    };

    await request(app).post("/api/users").send(userData).expect(201);

    // Then, fetch all users
    const res = await request(app).get("/api/users").expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.results).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should retrieve a user by ID", async () => {
    // Create a user first
    const userData = {
      name: "Test Retrieve",
      email: "retrieve@example.com",
      password: "password123",
    };

    const createRes = await request(app)
      .post("/api/users")
      .send(userData)
      .expect(201);

    const userId = createRes.body.data._id;

    // Retrieve the user
    const res = await request(app).get(`/api/users/${userId}`).expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data._id).toBe(userId);
    expect(res.body.data.name).toBe(userData.name);
  });

  it("should update a user", async () => {
    // Create a user first
    const userData = {
      name: "Test Update",
      email: "update@example.com",
      password: "password123",
    };

    const createRes = await request(app)
      .post("/api/users")
      .send(userData)
      .expect(201);

    const userId = createRes.body.data._id;

    // Update the user's name
    const updatedData = { name: "Updated Name" };
    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .send(updatedData)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.name).toBe(updatedData.name);
  });

  it("should delete a user", async () => {
    // Create a user first
    const userData = {
      name: "Test Delete",
      email: "delete@example.com",
      password: "password123",
    };

    const createRes = await request(app)
      .post("/api/users")
      .send(userData)
      .expect(201);

    const userId = createRes.body.data._id;

    // Delete the user
    await request(app).delete(`/api/users/${userId}`).expect(204);

    // Verify that retrieving the deleted user returns a 404
    await request(app).get(`/api/users/${userId}`).expect(404);
  });
});
