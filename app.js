if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));

const methodOverride = require('method-override');
app.use(methodOverride("_method"));

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname,"/public")));

const ExpressError = require('./utils/ExpressError.js');

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");

const dbURL = process.env.ATLASDB_URL;

const session = require("express-session");
const MongoStore = require('connect-mongo');

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=> {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000, //1 week
        httpOnly: true, //to prevent from cross-scripting attacks
    },
};


const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //store
passport.deserializeUser(User.deserializeUser()); //unstore



main().then(() => {
    console.log("connected to DB");
}).catch(err => 
    console.log(err)
);

async function main() {
  await mongoose.connect(dbURL);
}

// app.get("/", (req,res) => {
//     res.send("working");
// });

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.deleted = req.flash("deleted");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

//Listings :
app.use("/listings", listingsRouter);

//REVIEWS :
app.use("/listings/:id/reviews", reviewsRouter);

// //User :
app.use("/", usersRouter);

app.all("*", (req, res,next) => {
    next(new ExpressError(404, "Page Not Found!"));
});


//Error Handling
app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {err});
});

app.listen(8080, () => {
    console.log("Server listening to port 8080");
});

