const express = require("express");

// ejs layouts
const ejsLayouts = require("express-ejs-layouts");

// flash
const flash = require("connect-flash");

// express session and connect mongo to store session in db.
const expSession = require("express-session");
const MongoStore = require("connect-mongo");

// passport and it's strategies
const passport = require("passport");
const localStrategy = require("./config/passportLocal");
const gAuthStrategy = require("./config/passportGoogleAuth");

// variables
const devEnv = require("./env").developement;

// db connection
const dbConnect = require("./config/mongoDBConnection");

// custom middleware for flash
const flashMiddleware = require("./middlewares/flashMiddleware");

// Routes for app.
const Routes = require("./routes/indexRoutes");

// initiate app
const app = express();

// initiate middleware to extract form data in req.body
app.use(express.urlencoded());

// declare static content path
app.use(express.static(devEnv.STATIC_CONTENT));

// set view engine and view path
app.set("view engine", "ejs");
app.set("views", devEnv.views);

// declare to use ejs layouts as middleware
app.use(ejsLayouts);
// set layouts to extract styles and scripts from pages
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// initoate express session
app.use(expSession({
    // name to store
    name: "authSession",
    // secret key
    secret: devEnv.SESSION_KEY,

    // Preventing express session to save every time of page load
    // Prevent saving uninitialized sessions
    resave: false,
    saveUninitialized: false,

    // Declaring cookie max age in miliSeconds
    cookie: {
        maxAge: 10*60*1000
    },

    // using mongo store here to store session in db to avoid session loss on server restart
    store: MongoStore.create({
        mongoUrl: devEnv.MONGO_URL,
        stringify: false
    })
}));

// initiate app to use middleware
app.use(flash());

// initialize app to use custom middleware for flash
app.use(flashMiddleware.flashMsgTransfer);

// initializing passport and session
app.use(passport.initialize());
app.use(passport.session());

// initialize middleware created in passport local
app.use(passport.setAuthenticatedUser);

// initialize routes
app.use("/", Routes);

// Make app to listen at port
app.listen(devEnv.PORT, function(error){
    if(error){
        console.error(error);
    }

    console.log("Server running at port ", devEnv.PORT);
});