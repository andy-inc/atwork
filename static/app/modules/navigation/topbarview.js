define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var tmpl = require("text!templates/navigation/topbar.html")

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        events: {
            'click [data-type="action"][data-value="logout"]': "logout",
            'click [data-type="action"][data-value="login"]': "login"
        },

        initialize: function() {
            _.bindAll(this, 'render', 'onUserChange', 'logout', 'login');
            this.userModel = require("app").models.user;
            this.userModel.on("change", this.onUserChange);
            this.app = require("app");
        },

        onUserChange: function() {
            var self = this;
            this.$('[data-type="user"][data-toggle="login"]').show();
            this.$('[data-type="user"][data-toggle="logout"]').hide();

            if (this.userModel.get("accepted")) {
                this.$('[data-type="user"][data-toggle="login"]').hide();
                this.$('[data-type="user"][data-toggle="logout"]').show();
            }

            this.$('[data-type="field-value"]').each(function() {
                var $this = $(this);
                var field = $this.data('value');
                if (field.indexOf("|")>= 0){
                    field = field.split("|");
                    $this.text(self.userModel.get(field[0])||self.userModel.get(field[1]));
                } else {
                    $this.text(self.userModel.get(field));
                }
            });
        },

        logout: function(event) {
            var self = this;
            event.preventDefault();
            this.userModel.destroy({
                success: function(model, response) {
                    model.set({
                        accepted: false,
                        failed: false,
                        id: null
                    });
                    self.app.router.navigate("login", true);
                }
            });
        },

        login: function(event) {
            event.preventDefault();
            this.app.router.navigate("login", {
                trigger: true,
                replace: false
            });
        },

        render: function() {
            var html = this.template();
            $(this.el).html(html);

            this.onUserChange();

            return this;
        }

    });
});