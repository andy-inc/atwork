define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var tmpl = require("text!templates/user/denied.html");

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        events: {
            "hidden.bs.modal .modal": "onCancel"
        },

        initialize: function() {
            _.bindAll(this, 'render', 'open', 'close', 'onCancel');
            this.router = require("app").router;
        },

        onCancel: function() {
            this.router.navigate("/", true, true);
        },


        render: function() {
            var html = this.template();
            $(this.el).html(html);
            return this;
        },

        open: function() {
            this.$(".modal").modal("show");
        },

        close: function() {
            this.$(".modal").modal("hide");
        }

    });
});