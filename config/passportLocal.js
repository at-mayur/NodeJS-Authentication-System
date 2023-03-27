const passport = require("passport");
const passportLocal = require("passport-local").Strategy;

const User = require("../models/user");

// import encryption function
const encrypt = require("./encrypt");

// Initiating passport with new local strategy
passport.use(new passportLocal({
    // declaring username & Password fields
    // Similar to sign in form
    usernameField: "userMail",
    passwordField: "userPassword"
}, async function(username, password, done){
    try {
        // find emp with given mail id
        let user = await User.findOne({ user_email: username });

        // if not exist then return error null & emp false
        if(!user){
            return done(null, false, { type: "warning", message: "Invalid username or password..!!" });
        }

        // get encrypted password
        let encryptPass = encrypt.getEncryptedData(password);


        // if encrypted pass and password from db does not matches then return false
        if(user.user_password!=encryptPass){
            return done(null, false, { type: "warning", message: "Invalid username or password..!!" });
        }

        // otherwise return user
        user.user_password = "";
        return done(null, user);

    } catch (error) {
        console.error(error);
        return;
    }
    
}));

// Serializing emp i.e. telling passport to store only certain field of user data to cookie
passport.serializeUser(function(user, done){
    return done(null, user.id);
});

// Deserialize emp
// i.e. fetch all user details from user id that we have stored while serializing
passport.deserializeUser(async function(userId, done){

    try {

        let user = await User.findById(userId);

        if(!user){
            return done(null, false);
        }

        user.user_password = "";
        return done(null, user);
        
    } catch (error) {
        console.error(error);
        return;
    }

});

// Creating a middleware to check authentication
passport.checkAuthentication = function(request, response, next){

    // if authenticated request then executing next step
    if(request.isAuthenticated()){
        return next();
    }

    // if not authenticated request then back to sign in page
    request.flash('info', "Login in to continue..!!");
    return response.redirect("/user/sign-in");
}

// midlleware to pass authenticated user to response.locals
passport.setAuthenticatedUser = function(request, response, next){
    if(request.isAuthenticated()){
        response.locals.user = request.user;
    }

    return next();
}


module.exports = passport;