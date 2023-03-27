const passport = require("passport");

// importing G Auth strategy
const gStrategy = require("passport-google-oauth").OAuth2Strategy;

const crypto = require("node:crypto");

const User = require("../models/user");
const devEnv = require("../env").developement;

// initiating passport to use Google OAuth strategy
passport.use(new gStrategy({
    // client id, client secret, callback url
    // obtained from google developer console
    clientID: devEnv.G_CLIENT_ID,
    clientSecret: devEnv.G_CLIENT_SECRET,
    callbackURL: devEnv.G_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {

    try {

        // try to find user with mail id obtained from OAuth
        let user = await User.findOne({ user_email: profile.emails[0].value });

        // if user exists then return that user
        if(user){
            user.user_password = "";
            return done(null, user);
        }

        // If not exists then create new one with random password
        let newUser = await User.create({
            user_email: profile.emails[0].value,
            user_password: crypto.randomBytes(24).toString("hex"),
            user_name: profile.displayName,
            // Set social login field true. Will be using this field in password reset functionality.
            social_login: true
        });

        // return new user created
        newUser.user_password = "";
        return done(null, newUser);
        
    } catch (error) {
        
        console.error(error);
        return done(error, false);

    }

}));


module.exports = passport;