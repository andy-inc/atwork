/**
 * Created by andy <andy.sumskoy@gmail.com> on 16/12/13.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var ProfileModel = require("modules/home/models/profile");

    var tmpl = require("text!templates/home/profile.html");

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        events: {
            'submit': 'save'
        },

        initialize: function() {
            _.bindAll(this, 'render', 'onModelChange', 'save');
            this.app = require("app");
            this.model = new ProfileModel();
            this.model.fetch();
            this.model.on("change", this.onModelChange);
        },

        onModelChange: function(){
            this.$('[name="fio"]').val(this.model.get('fio') || "");
        },

        save: function(e){
            e.preventDefault();
            this.model.set("fio", this.$('[name="fio"]').val());
            this.model.save({}, {success: function(){
                this.app.models.user.update();
            }.bind(this)});
        },

        render: function() {
            var html = this.template();
            $(this.el).html(html);
            return this;
        }

    });
});
