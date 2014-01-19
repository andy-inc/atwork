/**
 * Created by andy <andy.sumskoy@gmail.com> on 07/12/13.
 */
var require = require('a.require');

var $ObjectID = require('mongodb').ObjectID;

var errors = require("./errors"),
    collection = require('a.config').db.client.collection("keys"),
    jsv = require("a.config").jsv,
    logger = require('the.logger').getLogger('atwork.models.keys');

jsv.createSchema({
    "$schema":"http://json-schema.org/draft-03/schema#",
    "id": "key:data#",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "code": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "userId": {
            "type": ["string", "null"],
            "pattern": "^[0-9a-fA-F]{24}$",
            "required": false
        },
        "enabled": {
            "type": "boolean",
            "required": false
        }
    }
});

exports.exists = function(code, callback){
    collection.count({code: code}, function(err, count){ callback(err, count > 0) });
};

exports.insert = function(key, callback){
    if (key.userId){
        key.userId = new $ObjectID(key.userId);
    } else {
        key.userId = null;
    }
    if (key.enabled == null){
        key.enabled = true;
    }
    exports.exists(key.code, function(err, exists){
        if (exists) {
            err = new errors.K1001(key.code);
        }
        if (err){
            callback(err);
        } else {
            collection.insert(key, function(err, data){ callback(err, (data || [])[0]); });
        }
    });
};

exports.update = function(keyId, key, callback){
    if (key.userId){
        key.userId = new $ObjectID(key.userId);
    } else {
        key.userId = null;
    }
    collection.findAndModify({_id: new $ObjectID(keyId)}, {},{$set: key},{new: true}, callback);
};

exports.remove = function(keyId, callback){
    collection.findOne({_id: new $ObjectID(keyId)}, function(err, key){
        if (err){
            callback(err);
            return;
        }
        if (key == null){
            callback(new errors.K1002(keyId));
            return;
        }
        collection.remove({_id: new $ObjectID(keyId)}, function(err){ callback(err, key); });
    });
};

exports.removeByCode = function(code, callback){
    collection.findOne({code: code}, function(err, key){
        if (err){
            callback(err);
            return;
        }
        if (key == null){
            callback(new errors.K1002(code));
            return;
        }
        collection.remove({code: code}, function(err){ callback(err, key); });
    });
};

exports.get = function(keyId, callback){
    collection.findOne({_id: new $ObjectID(keyId)}, callback);
};

exports.getByUserId = function(userId, callback){
    collection.findOne({userId: new $ObjectID(userId)}, callback);
};

exports.getAll = function(callback){
    collection.find({}).sort({"code": 1}).toArray(callback);
};

exports.toJSON = function(els){
    els = els || [];
    var map = function(el){
        return {
            id: el._id.toHexString(),
            code: el.code,
            userId: (el.userId ? el.userId.toHexString() : null)
        };
    };
    if (Array.isArray(els)){
        return els.map(map);
    } else {
        return map(els);
    }
};