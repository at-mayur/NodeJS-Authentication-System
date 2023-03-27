const express = require("express");
const passport = require("passport");

// importing controller actions.
const homeController = require("../controllers/homeController");

// Routes for user
const userRoutes = require("./userRoutes");

const router = express.Router();

// route for home page /
router.get("/", passport.checkAuthentication, homeController.homeController);

// direct routes with /user to userRotes
router.use("/user", userRoutes);


module.exports = router;