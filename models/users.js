const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const SALT_FACTOR = 10;

const usersSchema = mongoose.Schema ({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, required: true}
});

const doNothing = () => {
}

usersSchema.pre("save", function(done) {
    var user = this;
    if(!user.isModified("password")){
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if(err){
            return done(err);
        }
        bcrypt.hash(user.password, salt, doNothing, function(err, hashedpassword){
            if(err){
                return done(err);
            }
            user.password = hashedpassword;
            done();
        });
    });
});

usersSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch){
        done(err, isMatch);
        console.log("Verificando Match");
    });
}
usersSchema.methods.name = function() {
    return this.username;
}
const User = mongoose.model("User", usersSchema);
module.exports = User;