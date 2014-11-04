(function() {
    var PageFactory = {};
    PageFactory.Page = require('./page');
    PageFactory.GalleryPage = require('./galleryPage');
    PageFactory.ServicesPage = require('./servicesPage');

    var photos = require('./photos.json');

    var model = {
        'photos': photos
    };

    var pageDecls = [
        /*{
            id: 'stories',
            type: 'StoriesPage'
        },*/
        {
            id: 'services',
            type: 'ServicesPage'
        },
        {
            id: 'service',
            type: 'GalleryPage'
        },
        {
            id: 'about'
        },
        {
            id: 'contacts'
        }
    ];

    var pages = [];

    function constructKey(pageId, params) {
        return decodeURIComponent($.param(_.extend({id: pageId}, params)));
    }

    PageFactory.get = function(pageId, params) {
        var pageDecl = _.find(pageDecls, {id: pageId});

        var type = 'Page';

        if (pageDecl.type && _.isFunction(PageFactory[pageDecl.type])) {
            type = pageDecl.type;
        }

        var constructKeyFunc = constructKey;
        if (_.isFunction(PageFactory[type]['constructKey'])) {
            constructKeyFunc = PageFactory[type]['constructKey'];
        }

        var neededKey = constructKeyFunc(pageId, params);
        var page = _.find(pages, function(page) {
            return page.getKey() === neededKey;
        });

        if (!page) {
            page = new PageFactory[type](_.extend({}, params, {id: pageId}), model);
            pages.push(page);
        }

        return page;
    };

    module.exports = PageFactory;

})();
