const queue = require("../config/kue");

const mailControllers = require("../controllers/mailer");

// Create new processing task/worker for a queue
queue.process("forgotMail", function(job, done){

    // console.log("In worker..");
    // Sending mail using mail controller.
    mailControllers.forgotPassMailer(job.data);

    done();

});
