/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var Utils = require("utils");
    var UserCollection = require("modules/accounts/collections/users");
    var ViewEl = require("modules/accounts/infoview");

    var tmpl = require("text!templates/accounts/index.html");
    var editTmpl = require("text!templates/accounts/info.html");
    var removeTmpl = require("text!templates/accounts/remove.html");

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),
        editTemplate: _.template(editTmpl),
        removeTemplate: _.template(removeTmpl),

        events: {
            'click [data-type="action"][data-value="add"]': 'register'
        },

        initialize: function() {
            _.bindAll(this, 'render', 'register', 'showAlert', 'addView');
            this.router = require("app").router;
            this.collection = new UserCollection();


        },

        showAlert: function(window, msg) {
            if (msg) {
                window.find('[data-type="error-message"]').html(msg.replace("\n", "<br/>"));
                window.find('[data-type="error-window"]').show();
            } else {
                window.find('[data-type="error-window"]').hide();
            }
        },

        register: function(){
            $('#windows').find("[data-type='account-add']").remove();
            var wnd = $('<div data-type="account-add"></div>').append(this.editTemplate({
                fio: "",
                email: "",
                alias: "",
                password: ""
            }));
            wnd.find('[data-type="action"][data-value="OK"]').click(function() {
                var model = new this.collection.model({
                    fio: wnd.find('[name="fio"]').val(),
                    email: wnd.find('[name="email"]').val(),
                    alias: wnd.find('[name="alias"]').val(),
                    password: wnd.find('[name="password"]').val()
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

                $('#windows').find("[data-type='account-edit']").remove();
                var wnd = $('<div data-type="account-edit"></div>').append(this.editTemplate(model.toJSON()));
                wnd.find('[data-type="action"][data-value="OK"]').click(function() {

                    model.set({
                        fio: wnd.find('[name="fio"]').val(),
                        email: wnd.find('[name="email"]').val(),
                        alias: wnd.find('[name="alias"]').val(),
                        password: wnd.find('[name="password"]').val()
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

                $('#windows').find("[data-type='account-remove']").remove();
                var wnd = $('<div data-type="account-remove"></div>').append(this.removeTemplate(model.toJSON()));
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