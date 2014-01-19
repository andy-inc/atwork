/**
 * Created by andy <andy.sumskoy@gmail.com> on 07/12/13.
 */

//require
var require = require('a.require');
require.init({root: __dirname});
var $errors = require("./errors"),
    $path = require("path"),
    $MongoClient = require('mongodb').MongoClient,
    $async = require("async"),
    $jsv = require("JSV").JSV.createEnvironment();

//Logger

var env = process.NODE_ENV || "development";

var $LoggerFactory = require('the.logger');
$LoggerFactory.configure(__dirname + '/config/logger.json', {
    wrapConsole: env === "production",
    wrapUncaught: false,
    rootDir: __dirname
}).env(env).init();
var logger = $LoggerFactory.getLogger('atwork'),
    omnisLogger = $LoggerFactory.getLogger('atwork.omnis');

//App config
var $config = require('a.config');
$config.load(__dirname + '/config/app.json').env(env);

$config.jsv = $jsv;

var $omnisErrors = require('omnis.core').errors;

var $auth = require('omnis.core').plugins.authorization({allowByDefault: false});
$auth.addRule('default', function(controller, url, method, session, callback){
    var roles = controller.settings.authorization[method];
    if (session.user == null){
        callback(new $omnisErrors.OmnisAuthorizationUnauthorized());
    } else if ((session.user.allow || []).indexOf(roles) === -1 && (session.user.allow || []).indexOf('root') === -1){
        callback(new $omnisErrors.OmnisAuthorizationAccessDenied());
    } else {
        callback();
    }
});
$auth.addRule('default_with_self', function(controller, url, method, session, req, callback){
    var roles = controller.settings.authorization[method].split(',');
    var id = req.param('id', 'self');
    if (id === session.user._id.toString()) id = 'self';
    if (id === 'self') roles = roles[1]; else roles = roles[0];
    if (session.user == null){
        callback(new $omnisErrors.OmnisAuthorizationUnauthorized());
    } else if ((session.user.allow || []).indexOf(roles) === -1 && (session.user.allow || []).indexOf('root') === -1){
        callback(new $omnisErrors.OmnisAuthorizationAccessDenied());
    } else {
        callback();
    }
});
$auth.addRule('allow', function(session, callback){
    callback();
});

$auth.addRule('login', function(session, callback){
    if (session.user == null){
        callback(new $omnisErrors.OmnisAuthorizationUnauthorized());
    } else {
        callback();
    }
});

var errorSenderPlugin = {
    hooks: {
        'before-errors': function(){
            return function(err, req, res, next){
                if (err.instanceof == null){
                    next(err);
                    return;
                }
                if (err.instanceof($errors.A1001) || err.instanceof($errors.U1003) || err.instanceof($errors.K1002)){
                    res.status(404);
                } else if (err.instanceof($errors.U1001) || err.instanceof($errors.K1001)){
                    res.status(409);
                }
                if (req.isAPI){
                    res.send(err.toJSON());
                } else {
                    next(err);
                }
            }
        }
    }
};

var $Omnis;

exports.init = function(callback){
    callback = callback || function(){};

    $MongoClient.connect($config.db.url, function(err, db){
        if (err != null){
            logger.error(new $errors.M1000(err));
            callback(err);
        } else {
            $config.db.client = db;
            var UserModel = require('./models/user');
            $Omnis = require("omnis.core").Core;
            $Omnis.middleware(function(req, res, next){
                if (req.session.user != null){
                    UserModel.get(req.session.user._id.toString(), function(err, user){
                       if (err){
                           next(err);
                       } else {
                           if (user != null){
                                req.session.user = user;
                           } else {
                               delete req.session.user;
                           }
                           next();
                       }
                    });
                } else {
                    next();
                }
            });
            $Omnis.controller(require("./controllers/auth"));
            $Omnis.controller(require("./controllers/user"));
            $Omnis.controller(require("./controllers/key"));
            $Omnis.controller(require("./controllers/visit"));
            $Omnis.session('mongodb', $config.server.cookie.secret, { httpOnly: true, maxAge: 1000*60*60*24 }, $config.server.session);
            $Omnis.plugin($auth);
            $Omnis.plugin(require('omnis.core').plugins.validate({environment: $config.jsv}));
            $Omnis.plugin(errorSenderPlugin);
            $Omnis.init({root: __dirname, static: __dirname + '/static'});
            $Omnis.on('error', function(err){
                omnisLogger.error(err);
            });
            exports.start(function(err){
                if (err){
                    process.exit(1);
                }
                callback(err);
            });
        }
    });

};

exports.start = function(callback){
    callback = callback || function(){};

    $Omnis.start("http://"+$config.server.ip+":"+$config.server.port, function(err){
        if (err) {
            logger.error(err);
            callback(err);
            return;
        }
        logger.info('Listening on ' + $config.server.ip + ':' + $config.server.port);
        callback(null);
    });
};

exports.stop = function(){
    $Omnis.stop();
};