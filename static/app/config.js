// This is the runtime configuration file.  It complements the Gruntfile.js by
// supplementing shared properties.
require.config({
    paths: {
        // Make vendor easier to access.
        "vendor": "../vendor",

        //Text plugin
        "text": "../vendor/bower/requirejs-text/text",

        // Almond is used to lighten the output filesize.
        "almond": "../vendor/bower/almond/almond",

        // Opt for Lo-Dash Underscore compatibility build over Underscore.
        "underscore": "../vendor/bower/lodash/dist/lodash.underscore",

        // Map remaining vendor dependencies.
        "jquery": "../vendor/bower/jquery/jquery",
        "backbone": "../vendor/bower/backbone/backbone",

        // Bootstrap
        "bootstrap": "../vendor/bower/bootstrap/dist/js/bootstrap"/*,
        "colorpicker": "../vendor/bower/bootstrap-colorpicker/js/bootstrap-colorpicker",
        "autoNumeric": "../vendor/bower/autoNumeric/autoNumeric",

        //JQueryUI
        "jquery.ui": "../vendor/bower/jqueryui/ui/jquery-ui"*/
    },

    shim: {
        "jquery": {
            exports: "$"
        },
        // This is required to ensure Backbone works as expected within the AMD
        // environment.
        "backbone": {
            // These are the two hard dependencies that will be loaded first.
            deps: ["jquery", "underscore"],

            // This maps the global `Backbone` object to `require("backbone")`.
            exports: "Backbone"
        },
        "bootstrap": {
            deps: ["jquery"]
        },

        /*"jquery.ui": ["jquery"],
        "colorpicker": ["jquery"],
        "autoNumeric": ["jquery"],
        "modules/accounts/listview": ["colorpicker", "autoNumeric", 'jquery.ui']*/

        "app": ["bootstrap"],
        "router": ["jquery"]
    }
});