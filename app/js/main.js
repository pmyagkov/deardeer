var App = {};

/* borschik:include:page.js */

App._go = function(next) {
    console.log('Renderring page "' + next.id + '"');

    var stub = App._getPage('stub');

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
        stub.$node.hide();
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

    App.pages = _.map(App.pages, function(p) {
        var page = new App.Page(p);

        if (page.main) {
            Finch.route('/', App._go.bind(App, page));
            Finch.route('!', App._go.bind(App, page));
        } else {
            Finch.route(page.getUrl(), App._go.bind(App, page));
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

/**
 * {number|boolean}
 * @param id 0-based index of the photo
 */
App._slideToPhoto = function(id) {



};

App._initGallery = function() {




};

App.init = function() {
    App._rootObj = _.extend(App._rootObj || {}, {
        'photos': /* borschik:include:../images/photos/photos.json */
    });

    App._initPages();

    App._initGallery();
};

jQuery(function($) {
    App.init();
});
