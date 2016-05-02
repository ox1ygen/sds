var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//mongoose.connect('mongodb://localhost/sds');

//var db = mongoose.connection;

//USER SCHEMA
var userSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    }
});
//FOR EXPORT
var User = module.exports = mongoose.model('User', userSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.getUserByUsername = function (username, callback) {
    var query = {username: username};
    //console.log(User.findOne(query, callback));
    User.findOne(query, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};

module.exports.getUserById = function (id, callback) {
    //var query = {id: id};
    User.findById(id, callback);
};

module.exports.getUserByEmail = function (email, callback) {
    var query = {email: email};
    User.findOne(query, callback);
};