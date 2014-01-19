define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var tmpl = require("text!templates/navigation/sidebar.html")

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        events: {
            'click *[data-type="route"]': "route"
        },

        initialize: function() {
            _.bindAll(this, 'render', 'route', 'onRouteChange');
            this.router = require("app").router;
            this.router.bind("route", this.onRouteChange);
        },

        route: function(event) {
            event.preventDefault();
            var $target = $(event.target);
            if ($target.data("type") !== "route") {
                $target = $target.parent('*[data-type="route"]');
            }
            var localtion = "/" + $target.data('value');
            this.router.navigate(localtion, true);
        },

        onRouteChange: function(page) {
            this.$('*[data-type="route"]').parent("li").removeClass('active');
            this.$('*[data-type="route"]').each(function() {
                var el = $(this);
                if (page.indexOf(el.data("value")) == 0) {
                    el.parent("li").addClass('active');
                }
            });
        },

        render: function() {
            var html = this.template();
            $(this.el).html(html);
            return this;
        }

    });
});