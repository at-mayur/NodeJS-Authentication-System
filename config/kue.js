const kue = require("kue");

// Creating a queue
const queue = kue.createQueue();

module.exports = queue;