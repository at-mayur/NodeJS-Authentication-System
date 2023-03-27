const mailer = require("nodemailer");
const path = require("path");

const ejs = require("ejs");

const devEnv = require("../env").developement;

// Creating a transport for sending mails
const transport = mailer.createTransport({
    // Using gmail service & smtp server
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    // authentication for mail account
    auth: {
        user: devEnv.GOOGLE_MAIL_USER,
        pass: devEnv.GOOGLE_MAIL_PASSWORD
    }
});


// function to get mail template on providing data
const getTemplate = (data) => {

    let template = "";

    // render template file with ejs and provided data
    ejs.renderFile(path.join(__dirname, "../static/views/mailerTemp/forgotPasswdMailTemp.ejs"), data, function(error, outputTemp){

        if(error){
            console.error(error);
            return;
        }

        // store template in variable
        template = outputTemp;

    });

    // return template
    return template;

};


module.exports = {
    transport,
    getTemplate
};