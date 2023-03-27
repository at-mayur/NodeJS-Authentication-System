const express = require("express");
const passport = require("passport");

const userController = require("../controllers/userController");


const router = express.Router();

// Sign up & Sign in page routes
router.get("/sign-up", userController.signUpController);

router.get("/sign-in", userController.signInController);

// routes for login and create user action
router.post("/create-session", passport.authenticate("local", { failureRedirect: "/user/sign-in", failureFlash: true }), userController.createSessionController);

router.post("/create-user", userController.createUserController);

// Routes for forgot password
router.get("/forgot-password", userController.forgetPasswdController);

router.post("/forgot-password-action", userController.forgotPasswordMailAction);

router.get("/forgot-password-reset/:id", userController.forgotPasswordResetController);

router.post("/forgot-password-reset-action", userController.forgotPasswordResetAction);

// Routes for reset password
router.get("/reset-password", passport.checkAuthentication, userController.resetPasswdController);

router.post("/reset-password-action", passport.checkAuthentication, userController.resetPasswordAction);

// Routes for logout action
router.get("/sign-out", userController.signOutController);

// Routes for Google Authentication
router.get("/google-auth", passport.authenticate("google", { scope: ['email', "profile"] }));

router.get("/auth-google/verify", passport.authenticate("google", { failureRedirect: "/sign-in" }), userController.createSessionController);

// Route to verify captcha token.
router.get("/verify-captcha/:token", userController.verifyCaptcha);


module.exports = router;