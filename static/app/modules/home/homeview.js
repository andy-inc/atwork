define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var Utils = require("utils");
    var ProfileView = require("modules/home/profileview");
    var VisitsView = require("modules/home/visitsview");

    var tmpl = require("text!templates/home/index.html");

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        events: {

        },

        initialize: function() {
            _.bindAll(this, 'render');
            this.router = require("app").router;

        },

        render: function() {
            var html = this.template();
            $(this.el).html(html);
            this.profile = new ProfileView({el: this.$("#profile")}).render();
            this.visits = new VisitsView({el: this.$("#visits")}).render();
            return this;
        }

    });
});