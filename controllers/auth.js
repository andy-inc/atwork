/**
 * Created by andy <andy.sumskoy@gmail.com> on 07/12/13.
 */

var require = require('a.require');

var userModel = require("./models/user"),
    errors = require("./errors");

module.exports = exports = {
    version: 'v1',
    route: '/auth',
    plugins: {
        validate: {
            post: 'auth:user#'
        },
        authorization: {
            get: 'login',
            post: 'allow',
            'delete' : 'login'
        }
    },

    get: function(req, res){
        res.send(200,  {email: req.session.user.email, fio: req.session.user.fio});
    },

    post: function(req, res, next){
        var model = req.body;
        userModel.checkPassword(model.email, model.password, function(err, ok, user){
            if (err){
                next(err);
            } else if (ok) {
                req.session.user = user;
                res.send(200, {email: user.email, fio: user.fio});
            } else {
                res.send(404, new errors.A1001(model.email).toJSON());
            }
        });
    },

    'delete': function(req, res, next){
        delete req.session.user;
        res.send(204, "");
    }
};