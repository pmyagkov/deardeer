require('jade/runtime.js');


(function() {
    var Router = require('./router.js');

    var App = {};

    App.init = function() {
        Router.registerRoutes();
    };

    jQuery(function() {
        App.init();
    });

    module.exports = App;
})();
