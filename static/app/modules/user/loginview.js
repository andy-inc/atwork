define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var tmpl = require("text!templates/user/login.html")

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        events: {
            "hidden.bs.modal .modal": "onCancel",
            'keyup input': 'processKey',
            'click [data-type="action"][data-value="login"]': 'login'
        },

        initialize: function() {
            _.bindAll(this, 'render', 'open', 'close', 'onCancel', 'processKey', 'login', 'showAlert');
            this.router = require("app").router;
            this.model.on('change:failed', this.showAlert);
        },

        processKey: function(event) {
            if (event.which === 13) {
                this.login(event);
            }
        },

        onCancel: function() {
            this.router.back();
        },


        render: function() {
            var html = this.template();
            $(this.el).html(html);
            return this;
        },

        login: function(event) {
            var self = this;
            event.preventDefault();
            this.model.save({
                email: this.$('input[name="email"]').val(),
                password: this.$('input[name="password"]').val(),
                id: null
            }, {
                success: function() {
                    self.$('input[name="password"]').val("");
                    self.model.set({
                        accepted: true,
                        failed: false,
                        id: "loggedin"
                    });
                    self.close();
                },
                error: function(event, req) {
                    self.model.set({
                        accepted: false,
                        failed: req.responseText,
                        id: null
                    });
                }
            });
        },

        showAlert: function(event) {
            var msg = this.model.get('failed');
            if (msg) {
                this.$('[data-type="error-message"]').html(msg.replace("\n", "<br/>"));
                this.$('[data-type="error-window"]').show();
            } else {
                this.$('[data-type="error-window"]').hide();
            }
        },

        open: function() {
            this.showAlert();
            this.$(".modal").modal("show");
        },

        close: function() {
            this.$(".modal").modal("hide");
        }

    });
});