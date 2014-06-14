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

    /**
     *
     * @param id 0-based index of the photo
     */
    function slideToPhoto(id) {
        var marginTop = -id * 100;
        var backgroundPosition = marginTop / 4;
        $('.stories').css({'margin-top': marginTop + 'vh'});
        $('.paranja').css({'background-position': '0 ' + backgroundPosition + 'vh'});

        $('.thumb').removeClass('current').filter('[data-id=' + currentPhoto + ']').addClass('current');
    }

    $('.arrows .change').click(function(e) {
        var next = $(e.target).closest('.change').is('.down');
        currentPhoto = currentPhoto + (next ? 1 : -1);
        if (currentPhoto < 0) {
            currentPhoto = rootObj.photos.length - 1;
        } else if (currentPhoto > rootObj.photos.length - 1) {
            currentPhoto = 0;
        }

        slideToPhoto(currentPhoto);
    });

    $('.thumb').click(function(e) {
        var $target = $(e.target).closest('.thumb');
        var photoId = Number($target.data('id'));

        slideToPhoto(photoId);
    });
};

jQuery(function($) {

    App.init();



});
