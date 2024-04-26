const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDatabase = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log("Database Connection Established"))
        .catch((error) => {
            console.log("Failure While Connecting with Database");
            console.log(error);
            process.exit(1);
        })
}