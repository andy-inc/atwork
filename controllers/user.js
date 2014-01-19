/**
 * Created by andy <andy.sumskoy@gmail.com> on 10/12/13.
 */

var require = require('a.require');
var errors = require("./errors"),
    UserModel = require("./models/user");

module.exports = exports = {
    version: 'v1',
    route: '/user',
    plugins: {
        validate: {
            post: 'user:create#',
            'put-/:id': 'user:profile#'
        },
        authorization: {
            get: 'default',
            'post': 'default',
            'get-/:id': 'default_with_self',
            'put-/:id': 'default_with_self',
            'delete-/:id': 'default'
        }
    },
    settings: {
        authorization: {
            get: 'user-view',
            'post': 'user-create',
            'get-/:id': 'user-view,user-selfView',
            'put-/:id': 'user-update,user-selfView',
            'delete-/:id': 'user-remove'
        }
    },

    get: function(req, res, next){
        UserModel.getAll(function(err, data){
            if (err){
                next(err);
            } else {
                res.send(200, UserModel.toJSON(data));
            }
        });
    },
    'post': function(req, res, next){
        UserModel.insert(req.body, function(err, user){
            if (err){
                next(err);
            } else {
                res.send(200, UserModel.toJSON(user));
            }
        });
    },
    'get-/:id': function(req, res, next){
        var id = req.param("id", "self");
        if (id == "self"){
            id = req.session.user._id.toString();
        }
        UserModel.get(id, function(err, data){
            if (err){
                next(err);
            } else if (data != null) {
                res.send(200, UserModel.toJSON(data));
            } else {
                next(new errors.U1003(id));
            }
        });
    },
    'put-/:id': function(req, res, next){
        var id = req.param("id", "self");
        if (id == "self"){
            id = req.session.user._id.toString();
        }
        UserModel.updateProfile(id, req.body, function(err, data){
            if (err){
                next(err);
            } else {
                res.send(200, UserModel.toJSON(data));
            }
        });
    },
    'delete-/:id': function(req, res, next){
        var id = req.param("id", "self");
        if (id == "self"){
            id = req.session.user._id.toString();
        }
        UserModel.remove(id, function(err, user){
            if (err){
                next(err);
            } else {
                if (user._id.toString() == req.session.user._id.toString()){
                    delete req.session.user;
                }
                res.send(204, "");
            }
        });
    }
};