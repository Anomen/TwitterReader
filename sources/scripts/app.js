define(function (require) {
    "use strict";

    var Marionette = require("marionette"),
        Backbone   = require("backbone"),
        $          = require("jquery"),
        MainLayout = require("components/layout/MainLayout"),
        Routes     = require("./Routes"),
        app        = new Marionette.Application();

    // Start history when our application is ready
    app.on("start", function () {
        // Define new regions and render them.
        app.rootView = new MainLayout();
        $("body").html(app.rootView.render().$el);

        // initialize the router
        new Routes(app);

        Backbone.history.start();
    });

    // Start the application
    app.start();

    window.app = app;
});