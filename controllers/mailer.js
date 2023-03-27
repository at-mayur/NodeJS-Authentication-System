// importing transport and get template that we have created
const nodemailer = require("../config/nodemailer");

const devEnv = require("../env").developement;

// Action to send mail
module.exports.forgotPassMailer = function(data){
    // get template using getTemplate and data
    let template = nodemailer.getTemplate({ data });

    // Send mail to respective user
    nodemailer.transport.sendMail({
        from: devEnv.GOOGLE_MAIL_USER,
        to: data.user.user_email,
        subject: "Reset your account password",
        html: template
    }, function(error, info){
        // callback will execute after sending mail
        if(error){
            console.error(error);
            return;
        }

        // info will print details about mail.
        // console.log(info);
    });
};