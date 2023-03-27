

// Variables for app
module.exports.developement = {
    PORT: 8000,
    STATIC_CONTENT: "./static",
    views: "./static/views/",
    // express session key
    SESSION_KEY: "C9DC42CD43B6D8A28C6E6A475F6CA",
    // Mongo DB URL
    MONGO_URL: "mongodb://127.0.0.1:27017/authSystem",
    // secret pass and salt for creating cipher
    SECRET_PASS: "679EF7B85FB35CF86A2479B9ADFC3",
    SALT: "ibLiCqPlCq",

    // google auth credentials.
    // Client id & secret generated from google developer console.
    G_CLIENT_ID: "Enter your Google Client Id generated from Google developer console here",
    G_CLIENT_SECRET: "Enter your Google Client Secret generated from Google developer console here",
    // callback url for google authentication to redirect after authentication check
    G_CALLBACK_URL: "http://localhost:8000/user/auth-google/verify",

    // Captcha id & sceret generated from reCaptcha console
    CAPTCHA_VERIFY_SECRET: "Enter your Google reCaptcha Secret generated from Google reCaptcha Enterprise console here",
    CAPTCHA_VERIFY_ID: "Enter your Google reCaptcha Id generated from Google reCaptcha Enterprise console here",

    // Google mail account and app password for configuring mailer.
    GOOGLE_MAIL_PASSWORD: "Enter your Google App password generated from Google Account Settings here",
    GOOGLE_MAIL_USER: "Your Google email id here",
    
}
