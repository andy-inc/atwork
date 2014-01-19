// Break out the application running from the configuration definition to
// assist with testing.
require(["config"], function() {
    // Kick off the application.
    require(["app", "router", "modules/main/appview", "modules/main/models/user"], function(app, Router, AppView, UserModel) {
        // Define your master router on the application namespace and trigger all
        // navigation from this instance.
        app.router = new Router();

        $.ajaxSetup({
            statusCode: {
                401: function() {
                    // Redirec the to the login page.
                    app.router.navigate("login", {trigger: true, replace: false});

                },
                403: function() {
                    // 403 -- Access denied
                    app.router.navigate("denied", {trigger: true, replace: false});
                }
            }
        });

        app.views = {
            app: new AppView()
        };
        app.models = {
            user: new UserModel()
        };

        app.models.user.update = function(callback){
            app.models.user.fetch({
                success: function(model) {
                    model.set({
                        accepted: true,
                        failed: false,
                        id: "logged in"
                    });
                    if (callback) callback();
                }
            });
        };

        $("main").html(app.views.app.render().el);

        // Trigger the initial route and enable HTML5 History API support, set the
        // root folder to '/' by default.  Change in app.js.
        Backbone.history.start({
            pushState: true,
            root: app.root
        });
    });
});