define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var SidebarView = require("modules/navigation/sidebarview");
    var TopbarView = require("modules/navigation/topbarview");

    var HomeView = require("modules/home/homeview");
    var AccountsView = require("modules/accounts/accountsview");
    var KeysView = require("modules/keys/keysview");

    var tmpl = require("text!templates/main.html");

    // Defining the application router.
    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        initialize: function() {
            _.bindAll(this, 'render', 'onRoute', 'renderHome', 'renderAccounts', 'renderKeys');
            this.router = require("app").router;
            this.router.on("route", this.onRoute);
            this.current = "";
        },

        render: function() {

            var html = this.template();
            $(this.el).html(html);

            this.sidebar = new SidebarView({
                el: this.$("#sidebar")
            }).render();

            this.topbar = new TopbarView({
                el: this.$("#topbar")
            }).render();

            return this;
        },

        renderHome: function(){
            this.$("#content").empty();
            this.home = new HomeView();
            this.$("#content").append(this.home.render().el);

        },

        renderAccounts: function(){
            this.$("#content").empty();
            this.accounts = new AccountsView();
            this.$("#content").append(this.accounts.render().el);
        },

        renderKeys: function(){
            this.$("#content").empty();
            this.keys = new KeysView();
            this.$("#content").append(this.keys.render().el);
        },

        onRoute: function(page) {
            if (page === "home") {
                this.renderHome();
            } else if (page === "accounts") {
                this.renderAccounts();
            } else if (page === "keys"){
                this.renderKeys();
            } else {
                this.$("#content").empty();
            }
            this.current = page;
        }

    });
});