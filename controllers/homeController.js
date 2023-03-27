
// function to control action for "/"
module.exports.homeController = async function(req, res){

    try {

        // render homepage
        res.render("home", {
            title: "Auth | Home",
        });
        
    } catch (error) {
        
        // if error then print error and return to previous page
        console.error(error);
        return res.redirect("back");

    }
    

};