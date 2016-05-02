var mongoose = require('mongoose');
var utils = require('../models/utils');

var tokenSchema = mongoose.Schema({
    token: {
        type: String,
        index: true
    },
    uid: {
        type: String
    }
});
//FOR EXPORT
var Token = module.exports = mongoose.model('Token', tokenSchema);

//var tokens = {};

module.exports.consumeRememberMeToken = function (token, fn) {
    var query = {token: token};
    var uid;
    Token.findOne(query, function (err, token) {
        if (token) {
            uid = token.uid;
            console.log(token._id);
            //token._id = undefined;
            console.log(token._id);
            token.remove(uid);
            token.save();
            //Token.remove(query);
            //Token.save();
        }
        return fn(null, uid);
    });
    //var uid = tokens[token];
    // invalidate the single-use token
    //tmp_token._id = undefined;
    //tmp_token.save();
    //return fn(null, uid);
};

function saveRememberMeToken(token, uid, fn) {
    var newToken = new Token({
        token: token,
        uid: uid
    });
    console.log("NEW TOKEN = ", JSON.stringify(newToken));
    newToken.save();
    //tokens[token] = uid;
    return fn();
};

module.exports.issueToken = function (user, done) {
    var token = utils.randomString(64);
    saveRememberMeToken(token, user.id, function (err) {
        if (err) {
            return done(err);
        }
        return done(null, token);
    });
};

//module.exports.tokens = tokens;