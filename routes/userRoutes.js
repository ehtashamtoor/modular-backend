const express = require("express");
const userController = require("../controllers/userController");
const { check, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

// routes for creating and getting all users
router
  .route("/")
  .post(
    [
      check("name", "Name is required").notEmpty(),
      check("email", "Please include a valid email").isEmail(),
      check("password", "Password must be at least 6 characters long").isLength(
        { min: 6 }
      ),
      // active, role fields are set default in the user model, so can provide here explicitly if needed
      validateRequest, // to check if there are any validation errors
    ],
    userController.createUser
  )
  .get(userController.getAllUsers); // Get all users with filtering, sorting, pagination;

// routes for getting, updating and deleting a user
router
  .route("/:id")
  .get(
    [param("id", "Invalid ID").isMongoId(), validateRequest],
    userController.getUser
  )
  .patch(
    [
      param("id", "Invalid ID").isMongoId(),
      check("name").optional().notEmpty().withMessage("Name cannot be empty"),
      check("email")
        .optional()
        .isEmail()
        .withMessage("Please include a valid email"),
      check("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
      validateRequest,
    ],
    userController.updateUser
  )
  .delete(
    [param("id", "Invalid ID").isMongoId(), validateRequest],
    userController.deleteUser
  );

// route to get user details using aggregation
router.route("/userDetails").get(userController.getUserDetails);

// example route to update role or something in the doc
router.patch(
  "/update-role",
  [
    check("email", "Email is required").isEmail(),
    check("role", "Role is required").notEmpty(),
    validateRequest,
  ],
  userController.updateUserSettings
);

module.exports = router;
