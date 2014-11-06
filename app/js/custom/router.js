(function() {
    var PageFactory = require('./pageFactory');
    var vow = require('vow');

    var Router = {};
    var routes = {
        '/': 'services',
        '!': 'services',
        '!services/:type': 'service',
        '!services/:type/:gallery': 'service',
        '!about': 'about',
        '!contacts': 'contacts'
    };

    function setCurrentNav(page) {
        var className;
        switch (page.id) {
            case 'services':
            case 'service':
                className = 'services';
                break;

            default:
                className = page.id;
                break;
        }

        $('.navigation li').removeClass('current').filter('.' + className).addClass('current');
    }

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

        // FIXME: перевести на события – роутер ничего не должен знать про разметку
        setCurrentNav(next);

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
