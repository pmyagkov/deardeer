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
};

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

    // нужно получать при сборке
    var rootObj = {
        'photos': /* borschik:include:../images/photos/photos.json */
    };

    var currentPhoto = 0;

    $('.arrows .change').click(function(e) {
        var next = $(e.target).closest('.change').is('.down');
        currentPhoto = currentPhoto + (next ? 1 : -1);
        if (currentPhoto < 0) {
            currentPhoto = rootObj.photos.length - 1;
        } else if (currentPhoto > rootObj.photos.length - 1) {
            currentPhoto = 0;
        }
        $('.thumb').removeClass('current').filter(':eq(' + currentPhoto + ')').addClass('current');

    });

    $('.thumb').click(function(e) {
        var $target = $(e.target).closest('.thumb');
        var photoId = Number($target.data('id'));

        $('.stories').css('margin-top', -photoId*100 + 'vh');

        $('.thumb').removeClass('current');
        $target.addClass('current');
    });
};

jQuery(function($) {

    App.init();



});
