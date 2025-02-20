const User = require("../models/User");
const factory = require("../utils/factoryMethods");

// Create a new user
exports.createUser = factory.createOne(User);

// Get a single user by ID
exports.getUser = factory.getOne(User);

// Update a user by ID
exports.updateUser = factory.updateOne(User);

// Delete a user by ID
exports.deleteUser = factory.deleteOne(User);

// Get all users with filtering, sorting, and pagination
exports.getAllUsers = factory.getAll(User);

// This is a dummy example
// Get user details using aggregation
exports.getUserDetails = factory.getAllAgg(User, [
  { $match: { active: true } },
  { $group: { _id: "$role", total: { $sum: 1 } } },
]);

// Example: Singular Create or Update Controller
exports.updateUserSettings = factory.singularCreateAndUpdate(
  User,
  { email: "usertobemadeadmin@example.com" },
  { $set: { role: "admin", name: "default name" } }
);
