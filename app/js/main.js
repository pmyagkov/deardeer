var App = {};

App._go = function(page) {
    console.log(page.id);
    var $node = $('#' + page.id).show();

    if (!page.rendered) {
        if ($node.length) {
            App.$content.empty().append($node);
        } else {

        }

        page.rendered = true;
    }
};

App.pages = [
    {
        id: 'stories',
        main: true
    }, {
        id: 'about'
    }, {
        id: 'contacts'
    }
];

App._getPageHash = function(pageId) {
    return pageId;
}

App.init = function() {
    App.$content = $('.content');

    _.forEach(App.pages, function(p) {
        var page = p;
        if (page.main) {
            Finch.route('/', App._go.bind(App, page));
        }
        Finch.route(App._getPageHash(page.id), App._go.bind(App, page));
    });

    Finch.listen();
};

jQuery(function($) {

    App.init();



});
