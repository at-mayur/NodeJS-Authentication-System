
// custom middleware to transfer flash msgs from req to response
module.exports.flashMsgTransfer = function(req, res, next){
    let flashMessages = {};

    // see if msg exists
    let success = req.flash("success");
    let warning = req.flash("warning");
    let info = req.flash("info");
    if(success && success.length>0){
        flashMessages.success = success;
    }
    if(warning && warning.length>0){
        flashMessages.warning = warning;
    }
    if(info && info.length>0){
        flashMessages.info = info;
    }

    // return available msgs to response.locals
    res.locals.flashMessages = flashMessages;

    // move to next.
    next();
};