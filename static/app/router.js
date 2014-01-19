define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var LoginView = require("modules/user/loginview");
    var DeniedView = require("modules/user/deniedview");

    // Defining the application router.
    module.exports = Backbone.Router.extend({
        routes: {
            "home": "home",
            "accounts": "accounts",
            "keys": "keys",
            "login": "login",
            "denied": "denied",
            "*path": "defaultRoute"
        },

        initialize: function() {
            _.bindAll(this, 'home', 'login', 'denied', 'clear', 'defaultRoute', 'accounts', 'keys');
            this.app = require("app");
            this.title = $(document).attr('title');
            this.routesHit = 0;
            Backbone.history.on('route', function() {
                this.routesHit++;
            }, this);
        },

        back: function() {
            if (this.routesHit > 1) {
                window.history.back();
            } else {
                this.navigate('home', {
                    trigger: true,
                    replace: true
                });
            }
        },

        clear: function(callback) {
            callback = callback || function(){};
            $("#windows").find(".modal").modal("hide");
            var route = this.routes[Backbone.history.fragment];
            if (route !== "login"){
                if (this.loginView != null) {
                    this.loginView.close();
                }
                this.app.models.user.update(callback);
            }
            if (route !== "denied"){
                if (this.deniedView != null) {
                    this.deniedView.close();
                }
            }
        },

        home: function() {
            this.clear();
            $(document).attr('title', this.title + " - " + "Главная");
        },

        accounts: function() {
            this.clear();
            $(document).attr('title', this.title + " - " + "Пользователи");
        },

        keys: function() {
            this.clear();
            $(document).attr('title', this.title + " - " + "Ключи доступа");
        },

        denied: function() {
            this.clear();
            $(document).attr('title', this.title + " - " + "Доступ ограничен");
            if (this.deniedView == null){
                this.deniedView = new DeniedView({
                    el: $("#denied-window")
                }).render();
            }
            this.deniedView.open();
        },

        login: function() {
            this.clear();
            $(document).attr('title', this.title + " - " + "Авторизация");
            if (this.loginView == null){
                this.loginView = new LoginView({
                    model: this.app.models.user,
                    el: $("#login-window")
                }).render();
            }
            this.loginView.open();
        },

        defaultRoute: function(path) {
            this.clear(function(){
                setTimeout(function() {
                    this.navigate("home", true);
                }.bind(this), 500);
            }.bind(this));

        }
    });
});