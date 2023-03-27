const mongoose = require("mongoose");
const dev = require("../env").developement;

// Connecting to db
mongoose.connect(dev.MONGO_URL)
.then(() => {
    console.log("Connected to DB...");
})
// Handling error while connection
.catch((error) => {
    console.error(error);
});

module.exports = mongoose.connection;