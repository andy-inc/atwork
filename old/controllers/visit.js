/**
 * Created by Andy <andy@sumskoy.com> on 08/01/14.
 */
var require = require('a.require');

var errors = require("./errors"),
    VisitModel = require("./models/visit"),
    UserModel = require("./models/user");

module.exports = exports = {
    version: 'v1',
    route: '/visit',
    plugins: {
        validate: {
            post: 'visit:data#'
        },
        authorization: {
            'get-/:id': 'default_with_self',
            'get-/:id/ranges': 'default_with_self',
            'post': 'default'
        }
    },
    settings: {
        authorization: {
            'get-/:id': 'visit-view,visit-selfView',
            'get-/:id/ranges': 'visit-view,visit-selfView',
            'post': 'visit-create'
        }
    },

    'get-/:id': function(req, res, next){
        var id = req.param("id", "self");
        if (id == "self"){
            id = req.session.user._id.toString();
        }
        VisitModel.get(id, function(err, data){
            if (err){
                next(err);
            } else {
                res.send(200, VisitModel.toJSON(data));
            }
        });
    },
    'get-/:id/ranges': function(req, res, next){
        var id = req.param("id", "self");
        if (id == "self"){
            id = req.session.user._id.toString();
        }
        var from = new Date(+new Date() - 1000*60*60*24*14),
            to = new Date();
        VisitModel.getByDays(id, from, to, function(err, data){
            if (err){
                next(err);
            } else {
                res.send(200, data);
            }
        });
    },
    'post': function(req, res, next){
        VisitModel.register(req.body, function(err, user){
            if (err){
                next(err);
            } else {
                res.send(200, VisitModel.toJSON(user));
            }
        });
    }
};