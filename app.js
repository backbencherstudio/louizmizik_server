const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const route = require("./modules/users/users.routes");
const beatRoute = require("./modules/beat/beat.route");
const stripeRoute = require("./modules/payment/stripe.routes");

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://10.0.2.2:8081'], 
  credentials: true, 
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use(cookieParser());

app.use(
  session({
    secret: "changeit",
    resave: true, 
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);

app.use("api/users", route);
app.use("/api/beat", beatRoute)
app.use("/api/payments", stripeRoute)

app.use((req, res, next) => {
  res.status.json({
    message: "404! Route is not found",
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: "500! Something broken",
  });
});

module.exports = app;

//hello
