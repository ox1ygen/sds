var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');

//CONNECTION TO MONGO
mongoose.connect('mongodb://localhost/sds');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

//INIT APPLICATION
var app = express();

//VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

//EXPRESS SESSION
app.use(session({
    secret: 'secret',
    saveUnitialized: true,
    resave: true
}));

//PASSPORT INIT
app.use(passport.initialize());
app.use(passport.session());

//EXPRESS VALIDATOR
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//CONNECT FLASH
app.use(flash());

//GLOBAL VARIABLES
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users);


//SET PORT
app.set('port', 3000);

app.listen(app.get('port'), function () {
    console.log('Server is running on port ' + app.get('port'));
});