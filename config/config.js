require('dotenv').config()

const dev = {
    db:{
        url: process.env.MONGO_URI,
        //radisUrl: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` //`redis://redis:6379` // `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` //redis://[hostname]:[port] //redis://localhost:6379

    },
    app:{
        port: process.env.PORT || 1000
    }
}

module.exports = dev