const express = require('express');
const User = require('./models/users');
const Publications = require('./models/publications');
const passport = require('passport');
const acl = require('express-acl');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.currentPublications = req.publications;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");

   if(req.session.passport && req.user){
        req.session.role = req.user.role;
    }else{
        req.session.role = 'anonymous';
    }
    next();
});

acl.config({
    baseUrl: '/',
    defaultRole: 'anonymous',
    decodeObjectName: 'user',
    roleSearchPath: 'user.role'
});

router.use(acl.authorize);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
    var newDir = './public/usersImg/'+req.user.username;
    if (!fs.existsSync(newDir)){
        fs.mkdirSync(newDir);
    }
    cb(null,newDir)},
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now()
        + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('userImage');

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    }else{
        cb('Error: Images Only!');
    }
}

router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.render('pages/images', {
                msg: err
            });
        }
        else{
            if(req.file == undefined){
                res.render("pages/images", {
                    msg: 'Error: No File Selected'
                });
            }else{
                var dir = 'usersImg/'+req.user.username;
                res.render("pages/images", {
                    title: 'Gallery|Upload',
                    msg: 'File Uploaded',
                    file: `${dir}/${req.file.filename}`
                });
            }
        }
    });
});

router.get("/", (req, res, next) => {
    if (typeof req.user !== 'undefined'){
        var image_files = new Array();
        let user = req.user.username;
        const imageFolder = `./public/usersImg/${user}`;
        fs.readdir(imageFolder, (err, files) => {
            if(typeof files !== 'undefined' && req.user.role == 'normal'){
                files.forEach(file => {
                    image_files.push(file);
                });
            }
        });
        User.find()
        .exec((err, user) => {
            if(err){
                return next(err);
            }
            res.render('pages/index', {
                title: 'Gallery|Home',
                user: user,
                images: image_files,
                folder: imageFolder
            });   
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/login', function (req, res){
    res.render('pages/login', {
        title: 'Gallery|Login'
    });
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get('/signup', function (req, res){
    res.render('pages/signup', {
        title: 'Gallery|Signup'
    });
});

router.post("/signup", (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;
    User.findOne({username: username}, (err, user) => {
        if(err){
            return next(err);
        }
        if(user){
            req.flash("error", "Este usuario ya existe");
            return res.redirect("/signup");
        }
        var newUser = new User({
            username: username,
            password: password,
            role: role
        });
        newUser.save(next);
        return res.redirect("/");
    });
});

router.get('/images', function(req, res) {
    res.render('pages/images',{
        title: 'Gallery|Images'
    });
});

router.get('/publications', (req, res, next) => {
    Publications.find()
    .sort({createdAt: "descending"})
    .exec((err, publications) => {
        if(err){
            return next(err);
        }
        res.render("pages/publications", {
            publications: publications,
            title: 'Gallery|Publications'
        });
    });
});

router.post("/publications", (req, res, next) => {
    var title = req.body.title;
    var text = req.body.text;
    var role = req.body.role;

    Publications.findOne({title: title}, (err, publications) => {
        if(err){
            return next(err);
        }
        if(publications){
            req.flash("error", "Este titulo ya ha sido publicado");
            return res.redirect("/publications");
        }
        var newPublications = new Publications({
            title: title,
            text: text,
            role: role
        });
        newPublications.save(next);
        return res.redirect("/publications");
    });
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;