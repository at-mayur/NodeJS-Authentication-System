const crypto = require("node:crypto");

const User = require("../models/user");
const PasswordToken = require("../models/passwordResetToken");
const encrypt = require("../config/encrypt");

// importing queue & worker for sending mails
const queue = require("../config/kue");
const worker = require("../workers/mailWorker");

const devEnv = require("../env").developement;

// User creation action
module.exports.createUserController = async function(req, res){

    try {

        // If any of the field is null or undefined return to previous page
        if(!req.body.userName || !req.body.userMail || !req.body.userPassword || !req.body.cnfPassword){
            req.flash("warning", "Fill all mandatary fields.");
            return res.redirect("back");
        }

        // if password and confirm password is not matching return to previous page.
        if(req.body.userPassword!=req.body.cnfPassword){
            req.flash("warning", "User password and Confirm password do not match.");
            return res.redirect("back");
        }

        // try to find user with provided mail id.
        let user = await User.findOne({ user_email: req.body.userMail });

        // if user exists then return to prev page.
        if(user){
            req.flash("warning", "User with given email id already exists.");
            return res.redirect("back");
        }

        // if not exists then get password encrypted.
        let encryptPass = encrypt.getEncryptedData(req.body.userPassword);

        // create new user in db with encrypted password
        await User.create({
            user_name: req.body.userName,
            user_email: req.body.userMail,
            user_password: encryptPass
        });

        // return to sign in page
        req.flash("success", "User created successfully.");
        return res.redirect("/user/sign-in");
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};


// Action for login
module.exports.createSessionController = function(req, res){

    try {

        // if user is authenticated then go to home page.
        if(req.isAuthenticated()){
            req.flash("success", "Logged in successfully..!!");
            return res.redirect("/");
        }

        // otherwise return to prev page.
        req.flash("warning", "Not authorised to view this page!!");
        return res.redirect("/user/sign-in");
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};


// Action for sign up page render
module.exports.signUpController = function(req, res){

    try {

        // if user is authenticated then go to home page.
        if(req.isAuthenticated()){
            req.flash("info", "Already logged in..!!");
            return res.redirect("/");
        }

        // otherwise render Sign Up page.
        return res.render("signup", {
            title: "Auth | Sign Up",
            captcha: devEnv.CAPTCHA_VERIFY_ID
        });
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};


// Action for sign in page render
module.exports.signInController = function(req, res){

    try {

        // if user is authenticated then go to home page.
        if(req.isAuthenticated()){
            req.flash("info", "Already logged in..!!");
            return res.redirect("/");
        }

        // otherwise render Sign In page.
        return res.render("signin", {
            title: "Auth | Sign In",
            captcha: devEnv.CAPTCHA_VERIFY_ID
        });
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};

// Action for forgot password page render
module.exports.forgetPasswdController = function(req, res){

    try {

        // if user is authenticated then go to home page.
        if(req.isAuthenticated()){
            req.flash("warning", "You cannot use this option right now. Use Reset password instead!!");
            return res.redirect("/");
        }

        // otherwise render forgot password page.
        return res.render("forget", {
            title: "Auth | Forget",
        });
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};

// Action for reset password page render
module.exports.resetPasswdController = function(req, res){

    try {

        // if user is authenticated then render reset password page.
        if(req.isAuthenticated()){
            return res.render("resetpswd", {
                title: "Auth | Reset",
            });
        }

        // otherwise go to sign in page.
        req.flash("warning", "Not logged in or Session Expired!!\nLogin again to continue..");
        return res.redirect("/user/sign-in");
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};

// Action for sign out
module.exports.signOutController = function(req, res){

    // clear current active session
    req.logout(function(error){
        if(error){
            console.error(error);
            return res.redirect("back");
        }

        // redirect to sign in page after successful log off.
        req.flash("success", "Logged out successfully..!!");
        return res.redirect("/user/sign-in");
    });

};


// Action to verify captcha "/verify-captcha/:token"
module.exports.verifyCaptcha = async function(req, res){

    // fetch token sent with request
    let token = req.params.token;

    // create form data
    let formData = new FormData();
    // append secret and token received
    formData.append("secret", devEnv.CAPTCHA_VERIFY_SECRET);
    formData.append("response", token);

    // get response from google verify captcha
    let response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        body: formData,
    });

    // get response in json format
    let data = await response.json();

    // return response data
    return res.json(data);

};


// Action for forgot password "/forgot-password-action".
// i.e. after user submits his email to forgot password page
module.exports.forgotPasswordMailAction = async function(req, res){

    try {
        
        // find user with provided email id
        let user = await User.findOne({ user_email: req.body.userMail });

        // if user not exist return to prev page
        if(!user){
            req.flash("warning", "User does not exist");
            return res.redirect("back");
        }

        user.user_password = "";

        // try to find if any previous password reset token exists for same user.
        let token = await PasswordToken.findOne({ user: user.id });

        // if token exists then return to prev page
        if(token){
            req.flash("warning", "Link to reset password already sent. Please check your registered email id.");
            return res.redirect("back");
        }

        // if token does not exist then create new one for same user with random token
        let randomToken = crypto.randomBytes(24).toString("hex");
        let newToken = await PasswordToken.create({
            user: user.id,
            token: randomToken
        });

        // data to be sent to build mail template
        let mailData = {
            user,
            token: newToken.id
        };

        // create new job for worker to send mail to respective user.
        let job = queue.create("forgotMail", mailData).save(function(error){
            if(error){
                console.error(error);
                return res.redirect("back");
            }

            // console.log(job);
        });

        // return to prev page after sending mail
        req.flash("success", "Link to reset password sent to your registered email id.");
        return res.redirect("back");

    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};


// Action for forgot password reset page render "/forgot-password-reset/:id".
// i.e. action after user clicks link received on mail.
module.exports.forgotPasswordResetController = async function(req, res){

    try {

        // fetch token form id received with request.
        let token = await PasswordToken.findById(req.params.id);

        // if token does not exist or expired then return to sign-in page.
        if(!token){
            req.flash("warning", "Link expired..");
            return res.redirect("/user/sign-in");
        }

        // if token is valid then render reset forgot password page.
        return res.render("resetForgotPass.ejs", {
            title: "Reset Password",
            token: token
        })
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};


// Action for forgot password reset "/forgot-password-reset-action".
module.exports.forgotPasswordResetAction = async function(req, res){

    try {

        // fetch token with id received.
        let token = await PasswordToken.findById(req.body.tokenId);

        // if token does not exist or expired then return to sign-in page.
        if(!token){
            req.flash("warning", "Link expired..");
            return res.redirect("/user/sign-in");
        }

        // If any of the field is null or undefined return to previous page
        if(!req.body.userPassword || !req.body.cnfPassword){
            req.flash("warning", "Fill all mandatary fields.");
            return res.redirect("back");
        }

        // if password and confirm password is not matching return to previous page.
        if(req.body.userPassword!=req.body.cnfPassword){
            req.flash("warning", "User password and Confirm password do not match.");
            return res.redirect("back");
        }

        // try to find user with id present with token.
        let user = await User.findById(token.user);

        // if user does not exist then return to prev page.
        if(!user){
            req.flash("warning", "User does not exist");
            return res.redirect("back");
        }

        // if exists then get password encrypted.
        const encryptPass = encrypt.getEncryptedData(req.body.userPassword);

        // update user in db with encrypted password and set social_login to false.
        user.user_password = encryptPass;
        user.social_login = false;
        user.save();

        // delete token after password reset
        await PasswordToken.findByIdAndDelete(token.id);

        // return to sign in page.
        req.flash("success", "Password reset successful.");
        return res.redirect("/user/sign-in");
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};

// Action to reset password.
// i.e. when user submits new password
module.exports.resetPasswordAction = async function(req, res){

    try {

        // try to find user with provided id.
        let user = await User.findById(req.body.userId);

        // if user does not exist then return to prev page.
        if(!user){
            req.flash("warning", "User does not exist");
            return res.redirect("back");
        }

        // if current authenticated user and fetched user is different then return to prev page.
        if(req.user.user_email!=user.user_email){
            req.flash("warning", "You are not the authorised user to view this page");
            return res.redirect("back");
        }

        // if user logged in using google then return prev page.
        if(user.social_login){
            req.flash("warning", "You logged in using Google...!!");
            return res.redirect("back");
        }

        // if current password does not match then return to prev page.
        const currPass = encrypt.getEncryptedData(req.body.userCurrPassword);
        if(user.user_password!=currPass){
            req.flash("warning", "Current password does not match..!!");
            return res.redirect("back");
        }

        // if password and confirm password is not matching return to previous page.
        if(req.body.userNewPassword!=req.body.cnfNewPassword){
            req.flash("warning", "User password and Confirm password do not match.");
            return res.redirect("back");
        }

        // if new password and current password is matching return to previous page.
        if(req.body.userCurrPassword==req.body.userNewPassword){
            req.flash("warning", "Current password and new password should be different.");
            return res.redirect("back");
        }

        // update user in db with encrypted password
        const newPass = encrypt.getEncryptedData(req.body.userNewPassword);
        user.user_password = newPass;
        user.save();

        // return to home page.
        req.flash("success", "Password reset successful.");
        return res.redirect("/");
        
    } catch (error) {
        
        console.error(error);
        return res.redirect("back");

    }

};