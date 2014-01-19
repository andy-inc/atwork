/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var tmpl = require("text!templates/keys/el.html");
    var UserModel = require("modules/accounts/models/user");

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
            if (this.model.get("userId") != null){
                var user = new UserModel({id: this.model.get("userId")});
                user.fetch({success: function(){
                    var data = this.model.toJSON();
                    data.user = user.toJSON();
                    var html = this.template(data);
                    $(this.el).html(html);
                }.bind(this)});
            } else {
                var data = this.model.toJSON();
                data.user = {fio: "-не указан-"};
                var html = this.template(data);
                $(this.el).html(html);
            }
            return this;
        }
    });
});