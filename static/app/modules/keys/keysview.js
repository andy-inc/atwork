/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var Utils = require("utils");
    var KeysCollection = require("modules/keys/collections/keys");
    var ViewEl = require("modules/keys/infoview");
    var UserCollection = require("modules/accounts/collections/users");

    var tmpl = require("text!templates/keys/index.html");
    var editTmpl = require("text!templates/keys/info.html");
    var removeTmpl = require("text!templates/keys/remove.html");

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),
        editTemplate: _.template(editTmpl),
        removeTemplate: _.template(removeTmpl),

        events: {
            'click [data-type="action"][data-value="add"]': 'add'
        },

        initialize: function() {
            _.bindAll(this, 'render', 'add', 'showAlert', 'addView');
            this.router = require("app").router;
            this.collection = new KeysCollection();
            this.users = new UserCollection();
            this.users.fetch();
        },

        showAlert: function(window, msg) {
            if (msg) {
                window.find('[data-type="error-message"]').html(msg.replace("\n", "<br/>"));
                window.find('[data-type="error-window"]').show();
            } else {
                window.find('[data-type="error-window"]').hide();
            }
        },

        add: function(){
            $('#windows').find("[data-type='key-add']").remove();
            var wnd = $('<div data-type="key-add"></div>').append(this.editTemplate({
                code: "",
                userId: ""
            }));
            this.users.forEach(function(user){
                var $el = $("<option></option>").text(user.get("fio")).attr("value", user.get("id"));
                wnd.find('[name="userId"]').append($el);
            }.bind(this));
            wnd.find('[data-type="action"][data-value="OK"]').click(function() {
                var model = new this.collection.model({
                    code: wnd.find('[name="code"]').val(),
                    userId: wnd.find('[name="userId"]').val()
                });
                model.save({}, {success: function(){
                    wnd.find(".modal").modal("hide");

                    this.collection.add(model);
                    this.addView(model);

                }.bind(this), error: function(model, xhr, options){
                    this.showAlert(wnd, xhr.responseText);
                }.bind(this)});

            }.bind(this));
            wnd.find(".modal").modal("show");
            $("#windows").append(wnd);
        },

        render: function() {
            var html = this.template();
            $(this.el).html(html);

            this.collection.fetch({success: function(){
                this.collection.forEach(this.addView);
            }.bind(this)});

            return this;
        },

        addView: function(model){
            var view = new ViewEl({model: model}).render();
            this.$("tbody").append(view.el);

            view.on('edit', function(data){

                var model = data.model;

                $('#windows').find("[data-type='key-edit']").remove();
                var wnd = $('<div data-type="key-edit"></div>').append(this.editTemplate(model.toJSON()));
                this.users.forEach(function(user){
                    var $el = $("<option></option>").text(user.get("fio")).attr("value", user.get("id"));
                    if (model.get("userId") === user.id){
                        $el.attr("selected", true);
                    }
                    wnd.find('[name="userId"]').append($el);
                }.bind(this));
                wnd.find('[data-type="action"][data-value="OK"]').click(function() {

                    model.set({
                        code: wnd.find('[name="code"]').val(),
                        userId: wnd.find('[name="userId"]').val()
                    });
                    model.save({}, {success: function(){
                        wnd.find(".modal").modal("hide");
                    }, error: function(model, xhr, options){
                        this.showAlert(wnd, xhr.responseText);
                        model.fetch();
                    }.bind(this)});

                }.bind(this));
                wnd.find(".modal").modal("show");
                $("#windows").append(wnd);

            }.bind(this));

            view.on('remove', function(data){

                var model = data.model;

                $('#windows').find("[data-type='key-remove']").remove();
                var wnd = $('<div data-type="key-remove"></div>').append(this.removeTemplate(model.toJSON()));
                wnd.find('[data-type="action"][data-value="OK"]').click(function() {

                    model.destroy({success: function(){
                        wnd.find(".modal").modal("hide");
                        $(view.el).remove();
                        this.collection.remove(model);
                    }.bind(this), error: function(model, xhr, options){
                        this.showAlert(wnd, xhr.responseText);
                    }.bind(this)});

                }.bind(this));
                wnd.find(".modal").modal("show");
                $("#windows").append(wnd);

            }.bind(this));

        }

    });
});