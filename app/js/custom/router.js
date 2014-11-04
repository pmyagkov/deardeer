(function() {
    var PageFactory = require('./pageFactory');
    var vow = require('vow');

    var Router = {};
    var routes = {
        '!stories': 'stories',
        '/': 'services',
        '!': 'services',
        '!services/:type': 'service',
        '!services/:type/:gallery': 'service',
        '!about': 'about',
        '!contacts': 'contacts'
    };
/*
    console.log('Renderring page "' + next.id + '"');

    var stub = App._getPage('stub');
    stub.init();

    var def = $.Deferred().resolve();

    next.init(App._rootObj);

    if (App.pages.current) {
        if (next.id === App.pages.current.id) {
            return;
        }

        if (_.isFunction(App.pages.current.unload)) {
            def = App.pages.current.unload(next);
        }
    }

    if (!def || !def.then) {
        def = $.Deferred().resolve(def).promise();
    }

    App.pages.current = next;
    def.then(function() {
        var def;
        if (_.isFunction(next.load)) {
            def = next.load();
        }

        if (!def || !def.then) {
            def = $.Deferred().resolve(def);
        }

        return def.promise();
    }).then(function() {
        stub.unload();
    });*/

    function goto(nextPageId, params) {
        console.log('Rendering page', nextPageId, 'with params', params);

        var next = PageFactory.get(nextPageId, params);
        next.init();

        var def = vow.resolve();


        // если страница та же самая, то не нужно выгружать ту и загружать эту
        if (Router._currentPage === next) {
            next.transform(params);
            return;
        }

        if (Router._currentPage) {
            if (_.isFunction(Router._currentPage.unload)) {
                var result = Router._currentPage.unload(next);
                if (result && result.then) {
                    def = result;
                }
            }
        }

        Router._currentPage = next;

        def.then(function() {
            var promise = vow.resolve();
            if (_.isFunction(next.load)) {
                var result = next.load();
                if (result && result.then) {
                    promise = result;
                }
            }

            return promise;
        });
    }

    function getGotoFunc(pageId) {
        return function() {
            var args = [pageId].concat(Array.prototype.slice.call(arguments));
            return goto.apply(Router, args);
        };
    }

    Router.registerRoutes = function registerRoutes() {
        _.forOwn(routes, function(pageId, route) {
            Finch.route(route, getGotoFunc(pageId));
        });

        Finch.listen();
    };

    module.exports = Router;

})();
