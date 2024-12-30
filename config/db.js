const { default: mongoose } = require('mongoose')
 
const dev = require('./config');

const db_connection = async ()=>{
    try {
        await mongoose.connect(dev.db.url);
        console.log("Connected to database...");
      } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
      }
}

module.exports = db_connection