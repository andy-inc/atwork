/**
 * Created by andy <andy.sumskoy@gmail.com> on 07/12/13.
 */
var require = require('a.require');
var $bcrypt = require('bcrypt'),
    $ObjectID = require('mongodb').ObjectID,
    $async = require('async');

var logger = require('the.logger').getLogger('atwork.models.user'),
    errors = require("./errors"),
    collection = require('a.config').db.client.collection("user"),
    jsv = require("a.config").jsv,
    defaultUsers = require("a.config").defaultUsers,
    keysModel = require('./models/key');

jsv.createSchema({
    "$schema": "http://json-schema.org/draft-03/schema#",
    "id": "auth:user:email#",
    "type": "string",
    "pattern": "^([a-z0-9_\\.-]+)@([a-z0-9_\\.-]+)\\.([a-z\\.]{2,6})$"
});

jsv.createSchema({
    "$schema": "http://json-schema.org/draft-03/schema#",
    "id": "auth:user:password#",
    "type": "string",
    "minLength": 6
});

jsv.createSchema({
    "$schema":"http://json-schema.org/draft-03/schema#",
    "id": "auth:user#",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "email": {
            "extends": {"$ref": "auth:user:email#"},
            "required": true
        },
        "password": {
            "extends": {"$ref": "auth:user:password#"},
            "required": true
        }
    }
});

jsv.createSchema({
    "$schema":"http://json-schema.org/draft-03/schema#",
    "id": "user:profile#",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "fio": {
            "type": "string",
            "required": false
        },
        "email": {
            "extends": {"$ref": "auth:user:email#"},
            "required": false
        },
        "alias": {
            "type": "string",
            "required": false
        },
        "password": {
            "extends": {"$ref": "auth:user:password#"},
            "required": false
        }
    }
});

jsv.createSchema({
    "$schema":"http://json-schema.org/draft-03/schema#",
    "id": "user:create#",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "fio": {
            "type": "string",
            "required": false
        },
        "email": {
            "extends": {"$ref": "auth:user:email#"},
            "required": true
        },
        "alias": {
            "type": "string",
            "required": false
        },
        "password": {
            "extends": {"$ref": "auth:user:password#"},
            "required": true
        }
    }
});

exports.exists = function(email, callback){
    collection.count({email: email}, function(err, count){ callback(err, count > 0) });
};

exports.checkPassword = function(email, password, callback){
    collection.findOne({email: email}, function(err, user){
        if (user == null && !err) {
            callback(err, false);
            return;
        }
        if (err){
            callback(err);
        } else {
            comparePassword(password, user.password, function(err, ok){
                callback(err, ok, user);
            });
        }
    });
};

exports.insert = function(user, callback){
    exports.exists(user.email, function(err, exists){
        if (exists) {
            err = new errors.U1001(user.email);
        }
        if (err){
            callback(err);
        } else {
            cryptPassword(user.password, function(err, password){
                if (err){
                    callback(err);
                } else {
                    user.password = password;
                    user.allow = ['user-selfView', 'visit-selfView'];
                    collection.insert(user, function(err, data){ callback(err, (data || [])[0]); });
                }
            });
        }
    });
};

exports.updateProfile = function(userId, profile, callback){
    var updateUser = function(callback){
        collection.findAndModify({_id: new $ObjectID(userId)}, {},{$set: profile},{new: true}, callback);
    };
    var checkPassword = function(callback){
        if (profile.hasOwnProperty("password") && !!profile.password) {
            cryptPassword(profile.password, function(err, password){
                if (err){
                    callback(err);
                } else {
                    profile.password = password;
                    updateUser(callback);
                }
            });
        } else {
            delete profile.password;
            updateUser(callback);
        }
    };
    if (!!profile.email){
        collection.count({email: profile.email, _id: {$ne: new $ObjectID(userId)}}, function(err, count){
            if (count > 0) {
                err = new errors.U1001(profile.email);
            }
            if (err){
                callback(err);
            } else {
                checkPassword(callback);
            }
        });
    } else {
        checkPassword(callback);
    }


};

exports.remove = function(userId, callback){
    collection.findOne({_id: new $ObjectID(userId)}, function(err, user){
        if (err){
            callback(err);
            return;
        }
        if (user == null){
            callback(new errors.U1003(userId));
            return;
        }
        if (user.sys){
            callback(new errors.U1002(user.email));
            return;
        }
        collection.remove({_id: new $ObjectID(userId)}, function(err){ callback(err, user); });
    });
};

exports.removeByEmail = function(email, callback){
    collection.findOne({email: email}, function(err, user){
        if (err){
            callback(err);
            return;
        }
        if (user == null){
            callback(new errors.U1003(email));
            return;
        }
        if (user.sys){
            callback(new errors.U1002(user.email));
            return;
        }
        collection.remove({email: email}, function(err){ callback(err, user); });
    });
};

exports.get = function(userId, callback){
    collection.findOne({_id: new $ObjectID(userId)}, function(err, user){
        if (err){
            callback(err);
            return;
        }
        if (user != null){
            keysModel.getByUserId(userId, function(err, key){
                if (key != null){
                    user.key = keysModel.toJSON(key);
                }
                callback(err, user);
            });
        } else {
            callback(err, user);
        }
    });
};

exports.getAll = function(callback){
    collection.find({}).sort({"fio": 1}).toArray(function(err, data){
        if (err){
            callback(err);
            return;
        }
        $async.eachSeries(data, function(user, next){

            keysModel.getByUserId(user._id.toString(), function(err, key){
                if (key != null){
                    user.key = keysModel.toJSON(key);
                }
                next(err);
            });

        }, function(err){
            callback(err, data);
        })
    });
};


var cryptPassword = function(password, callback) {
    $bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            callback(err);
        } else {
            $bcrypt.hash(password, salt, function(err, hash) {
                callback(err, hash);
            });
        }
    });
};

var comparePassword = function(password, userPassword, callback) {
    $bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
        if (err){
            callback(err);
        } else {
            callback(null, isPasswordMatch);
        }
    });
};

$async.eachSeries(defaultUsers, function(user, next){

    collection.count({email: user.email}, function(err, c){
        if (c) {
            next();
            return;
        }
        exports.insert({email: user.email, password: user.password}, function(err, result){
            if (err){
                next(err);
            } else {
                collection.update({_id: result._id}, {$set: {allow: user.allow, sys: true}}, function(err){
                    next(err);
                });
            }
        });
    });

}, function(err){
    if (err){
        logger.error("Can not create default users", err);
    }
});

function isFunction(fn) {
    var getType = {};
    return fn && getType.toString.call(fn) === '[object Function]';
}

exports.toJSON = function(els){
    els = els || [];
    var map = function(el){
        return {
            id: el._id.toHexString(),
            email: el.email,
            fio: el.fio || "",
            alias: el.alias || "",
            key: el.key || null,
            sys: el.sys || false
        };
    };
    if (Array.isArray(els)){
        return els.map(map);
    } else {
        return map(els);
    }
};
