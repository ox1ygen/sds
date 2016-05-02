var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var User = require('../models/users');


//REGISTER
router.get('/register', function (req, res) {
    //console.log("hello");
    //console.log(username);
    res.render('register');
});

//LOGIN
router.get('/login', function (req, res) {
    res.render('login');
});

router.use(expressValidator({
    customValidators: {
        isUsernameAvailable: function (username) {
            return new Promise(function (resolve, reject) {
                User.getUserByUsername(username, function (err, user) {
                    if (err) throw err;
                    if (user) {
                        reject();
                    }
                    else {
                        resolve();
                    }
                });

            })
        },
        isEmailAvailable: function (email) {
            return new Promise(function (resolve, reject) {
                User.getUserByEmail(email, function (err, email) {
                    if (err) throw err;
                    if (email) {
                        reject();
                    }
                    else {
                        resolve();
                    }
                });
            })
        }
    }
}));

//var name;
//var username;
//var email;
//var password;
//var confirm_password;

//REGISTER USER
router.post('/register', function (req, res) {
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    //name = req.body.name;
    //username = req.body.username;
    //email = req.body.email;
    //password = req.body.password;
    //confirm_password = req.body.confirm_password;
    //FORM VALIDATION
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('email', 'Email is not unique').isEmailAvailable();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('username', 'Username is not unique').isUsernameAvailable();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirm_password', "Passwords don't match").equals(req.body.password);

    var a = req.asyncValidationErrors();

    a.catch(function (errors) {
        console.log("IN CATCH BLOCK");
        console.log(errors);
        if (errors) {
            res.render('register', {
                errors: errors,
                params: [req.body.name, req.body.username, req.body.email]
            });
        }
    });

    a.then(function () {
        console.log("GOOD");
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) {
                throw err;
            }
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    });


});

//PASSPORT STRATEGY
passport.use(new LocalStrategy(
    function (username, password, done) {
        console.log(username);
        console.log(password);
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) return done(null, false, {message: 'Unknown user'});

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user)
                }
                else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }));

//SERIALIZATION AND DESERIALIZATION
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});


//LOGIN
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/');
    });

//LOGOUT
router.get('/logout', function (req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});

module.exports = router;