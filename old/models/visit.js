/**
 * Created by Andy <andy@sumskoy.com> on 08/01/14.
 */
var require = require('a.require');

var $ObjectID = require('mongodb').ObjectID;

var errors = require("./errors"),
    jsv = require("./config/app").jsv,
    collection = require('./config/app').db.client.collection("visits"),
    keysCollection = require('./config/app').db.client.collection("keys");

jsv.createSchema({
    "$schema":"http://json-schema.org/draft-03/schema#",
    "id": "visit:data#",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "keyId": {
            "type": "string",
            "required": true,
            "minLength": 1
        },
        "date": {
            "type": "date",
            "required": true
        }
    }
});

exports.register = function(model, callback){
    var keyId = model.keyId,
        date = new Date(model.date);
    keysCollection.findOne({code: keyId}, function(err, key){
        if (key == null && err == null){
            err = new errors.K1002(keyId);
        }
        if (err){
            callback(err);
            return;
        }
        collection.insert({keyId: keyId, userId: key.userId, date: date}, function(err, result){
            result = result || [];
            callback(err, result[0] || null);
        });
    });
};

exports.get = function(userId, callback){
    collection.find({userId: new $ObjectID(userId)}).sort({date: -1}).limit(10).toArray(callback);
};

exports.getByDays = function(userId, from ,to, callback){
    from.setMilliseconds(0);
    from.setSeconds(0);
    from.setMinutes(0);
    from.setHours(0);
    to.setMilliseconds(999);
    to.setSeconds(59);
    to.setMinutes(59);
    to.setHours(23);


    collection.find({userId: new $ObjectID(userId), date: {$lte: to, $gte: from}}).sort({date: 1}).toArray(function(err, data){
        if (err){
            callback(err);
            return;
        }
        data = data.map(function(el){
            el.day = new Date(el.date);
            el.day.setMilliseconds(0);
            el.day.setSeconds(0);
            el.day.setMinutes(0);
            el.day.setHours(0);
            return el;
        });

        var result = {};
        data.forEach(function(el){
            var day = el.day;
            if (result[day.toString()] == null){
                result[day.toString()] = [];
            }
            if (result[day.toString()].length === 0 || result[day.toString()][result[day.toString()].length-1].stop != null){
                result[day.toString()].push({userId: userId, day: day, start: el.date, stop: null, duration: null});
            } else {
                var last = result[day.toString()][result[day.toString()].length-1];
                last.stop = el.date;
                last.duration = Math.round((+last.stop - +last.start) / (1000 * 60));
            }
        });

        var out = [];

        for(var day in result) if (result.hasOwnProperty(day)){
            var inDay = result[day];
            var duration = 0;
            inDay.forEach(function(el){
                if (el.duration != null){
                    duration += el.duration;
                }
            });
            out.push({
                day: new Date(day),
                duration: duration,
                ranges: inDay
            });
        }
        callback(null, out);
    });
};

exports.toJSON = function(els){
    els = els || [];
    var map = function(el){
        return {
            id: el._id.toHexString(),
            keyId: el.keyId,
            date: el.date,
            userId: el.userId
        };
    };
    if (Array.isArray(els)){
        return els.map(map);
    } else {
        return map(els);
    }
};
