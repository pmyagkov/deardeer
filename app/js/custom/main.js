require('jade/runtime.js');

var App = {};


/* borschik:include:pages/page.js */
/* borschik:include:pages/storiesPage.js */
/* borschik:include:pages/servicesPage.js */
/* borschik:include:pages/galleryPage.js */

App.go = function(next) {
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
            def = App.pages.current.unload();
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
    });
};

App._getPage = function(id) {
    var page = _.find(App.pages, {id: id});
    if (!page) {
        throw Error('Page "' + id + '" can\'t be found');
    }
    return page;
};


App._initPages = function() {
    var $pages = $('.page');
    App._isSPA = false;
    if ($pages.length === App.pages.length) {
        App._isSPA = true;
    }

    App.pages = _.map(App.pages, function(options) {
        var type = 'Page';
        if (options.type && _.isFunction(App[options.type])) {
            type = options.type;
        }

        options.model = App._rootObj;

        var page = new App[type](options);

        if (page.main) {
            Finch.route('/', App.go.bind(App, page));
            Finch.route('!', App.go.bind(App, page));
        } else {
            Finch.route(page.getUrl(), App.go.bind(App, page));
            if (App._isSPA) {
                page.$node.addClass('transparent');
            }

        }

        return page;
    });

    Finch.listen();
};

App.pages = [
    {
        id: 'stub'
    },
    {
        id: 'stories',
        type: 'StoriesPage'
    },
    {
        id: 'services',
        type: 'ServicesPage',
        main: true
    },
    {
        id: 'service',
        type: 'ServicePage',
        url: 'services/bouquets'
    },
    {
        id: 'about'
    },
    {
        id: 'contacts'
    }
];

App.baseUrl = '!';


App.init = function() {
    App._rootObj = _.extend(App._rootObj || {}, {
        'photos': /* borschik:include:../../images/photos/photos.json */
    });

    App._initPages();
};

jQuery(function() {
    App.init();
});
