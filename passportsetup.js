const passport = require('passport');
const User = require('./models/users');
const LocalStrategy = require('passport-local').Strategy;

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};
passport.use("login", new LocalStrategy(function(username, password, done){
    User.findOne({username: username}, function(err, user) {
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: "This user doesn't exist"})
        }
        user.checkPassword(password, (err, isMatch) => {
            if(err){
                return done(err);
            }
            if(isMatch){
                return done(null, user)
                console.log("Contraseña valida");
            }else{
                return done(null, false, {message: "Incorrect password"})
            }
        });
    });
}));