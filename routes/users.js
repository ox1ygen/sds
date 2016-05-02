var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;
var expressValidator = require('express-validator');
var User = require('../models/users');
var Token = require('../models/tokens');



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

//PASSPORT REMEMBER ME STRATEGY
passport.use(new RememberMeStrategy(
    function (token, done) {
        console.log("Tokens start validating");
        console.log("Tokens all = ", JSON.stringify(Token));
        Token.consumeRememberMeToken(token, function (err, id) {
            console.log("Token for search is ", JSON.stringify(token));
            if (err) {
                return done(err);
            }
            if (!id) {
                return done(null, false);
            }
            console.log("TOKEN IS FOUND, UP TO USER CHECK");
            User.getUserById(id, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            });
        });
    },
    Token.issueToken
));


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
//router.post('/login',
//    passport.authenticate('local', {
//        successRedirect: '/',
//        failureRedirect: '/users/login',
//        failureFlash: true
//    }),
//    function (req, res) {
//        res.redirect('/');
//    }
//);

router.post('/login',
    passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: true}),
    function (req, res, next) {
        // Issue a remember me cookie if the option was checked
        if (!req.body.remember_me) {
            console.log("remember me is not taken");
            return next();
        }

        console.log("remember me is taken");
        //console.log("Tokens all = ", JSON.stringify(Token.tokens));
        Token.issueToken(req.user, function (err, token) {
            if (err) {
                return next(err);
            }
            console.log("token = " + token);
            res.cookie('remember_me', token, {path: '/', httpOnly: true, maxAge: 604800000});
            return next();
        });
        //console.log("Tokens all = ", JSON.stringify(Token.tokens));
    },
    function (req, res) {
        res.redirect('/');
    });

//LOGOUT
router.get('/logout', function (req, res) {
    req.logout();

    res.clearCookie('remember_me');
    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});

module.exports = router;