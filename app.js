const express = require('express');
const moongose = require('mongoose');
const multer = require('multer');

const router = express.Router();

const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportsetup = require('./passportsetup');

const app = express();

moongose.connect("mongodb://JessicaSN:jsn980930@ds121382.mlab.com:21382/gallery");

passportsetup();

app.use(express.static(path.resolve(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret:"Monstruoso",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize({
    userProperty:"user"
}));
app.use(passport.session());

app.use(flash());

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
app.use(require('./routes'));


app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () =>{
    console.log("La aplicacion inicio por el puerto: " + app.get("port"));
});

module.exports = app;