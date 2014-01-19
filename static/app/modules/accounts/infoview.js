/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var tmpl = require("text!templates/accounts/el.html");

    module.exports = Backbone.View.extend({

        tagName: "tr",

        template: _.template(tmpl),

        events: {
            'click [data-type="action"][data-value="edit"]': 'edit',
            'click [data-type="action"][data-value="remove"]': 'remove'
        },

        initialize: function() {
            _.bindAll(this, 'render', 'edit', 'remove');
            this.router = require("app").router;
            this.model.on("change", this.render);

        },

        edit: function(){
            this.trigger("edit", {model: this.model});
        },

        remove: function(){
            this.trigger("remove", {model: this.model});
        },

        render: function() {
            var html = this.template(this.model.toJSON());
            $(this.el).html(html);
            return this;
        }
    });
});