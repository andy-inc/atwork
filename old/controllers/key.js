/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */

var require = require('a.require');
var errors = require("./errors"),
    KeyModel = require("./models/key");

module.exports = exports = {
    version: 'v1',
    route: '/key',
    plugins: {
        validate: {
            post: 'key:data#',
            'put-/:id': 'key:data#'
        },
        authorization: {
            get: 'default',
            'post': 'default',
            'get-/:id': 'default',
            'put-/:id': 'default',
            'delete-/:id': 'default'
        }
    },
    settings: {
        authorization: {
            get: 'key-view',
            'post': 'key-create',
            'get-/:id': 'key-view',
            'put-/:id': 'key-update',
            'delete-/:id': 'key-remove'
        }
    },

    get: function(req, res, next){
        KeyModel.getAll(function(err, data){
            if (err){
                next(err);
            } else {
                res.send(200, KeyModel.toJSON(data));
            }
        });
    },
    'post': function(req, res, next){
        KeyModel.insert(req.body, function(err, user){
            if (err){
                next(err);
            } else {
                res.send(200, KeyModel.toJSON(user));
            }
        });
    },
    'get-/:id': function(req, res, next){
        var id = req.param("id", "");
        KeyModel.get(id, function(err, data){
            if (err){
                next(err);
            } else if (data != null) {
                res.send(200, KeyModel.toJSON(data));
            }  else {
                next(new errors.K1002(id));
            }
        });
    },
    'put-/:id': function(req, res, next){
        var id = req.param("id", "");
        KeyModel.update(id, req.body, function(err, data){
            if (err){
                next(err);
            } else {
                res.send(200, KeyModel.toJSON(data));
            }
        });
    },
    'delete-/:id': function(req, res, next){
        var id = req.param("id", "");
        KeyModel.remove(id, function(err, user){
            if (err){
                next(err);
            } else {
                res.send(204, "");
            }
        });
    }
};
