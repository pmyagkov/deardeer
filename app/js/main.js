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

/**
 * {number|boolean}
 * @param id 0-based index of the photo
 */
App._slideToPhoto = function(id) {

    // down
    var direction = true;
    var next;
    if (_.isBoolean(id)) {
        direction = id;
        next = App._currentPhoto + (direction ? 1 : -1);
    } else {
        next = id;
        direction = next - App._currentPhoto > 0;
    }

    if (next < 0) {
        next = App._rootObj.photos.length - 1;
    } else if (next > App._rootObj.photos.length - 1) {
        next = 0;
    }

    var $thumbsList = $('.thumbs');
    var $thumbs = $thumbsList.find('> .thumb');
    // если текущая и следующая фотографии находятся в разных раскладках
    var rowNumber = Math.floor(next / App._thumbsPerRow);
    if (rowNumber !== Math.floor(App._currentPhoto / App._thumbsPerRow)) {
        var thumbsMarginTop = -rowNumber * App._thumbHeight * App._thumbsPerRow;
        $thumbsList.css('margin-top', thumbsMarginTop + 'px');
        setTimeout(function() {
            // скрываем первую превьюшку в следующем ряду и последнюю в предыдущем
            var selector = [(rowNumber + 1) * App._thumbsPerRow, rowNumber * App._thumbsPerRow - 1]
                .map(function(i) { return ':eq(' + i + ')'; })
                .join(',');
            $thumbs.removeClass('invisible').filter(selector).addClass('invisible');
        }, 200);

    }

    App._currentPhoto = next;

    var marginTop = -next * 100;
    var backgroundPosition = marginTop / 4;
    $('.stories').css({'margin-top': marginTop + 'vh'});
    var $flowers = $('.flowers');
    $flowers.filter('.flowers_front').css({'background-position': '0 ' + backgroundPosition + 'vh'});
    $flowers.filter('.flowers_middle').css({'background-position': '0 ' + (backgroundPosition / 2) + 'vh'});
    $flowers.filter('.flowers_back').css({'background-position': '0 ' + (backgroundPosition / 4) + 'vh'});

    $thumbs.removeClass('current').filter('[data-id=' + next + ']').addClass('current');


};

App._initGallery = function() {

    App._rootObj = _.extend(App._rootObj || {}, {
        'photos': /* borschik:include:../images/photos/photos.json */
    });

    App._currentPhoto = 0;



    var height = $('body').height();
    var $thumb = $('.thumb:first');
    App._thumbHeight = $thumb.outerHeight() + parseInt($thumb.css('margin-top')) + parseInt($thumb.css('margin-bottom'));

    var $thumbs = $('.thumb');
    App._thumbsPerRow = Math.floor(height / App._thumbHeight);
    $thumbs.eq(App._thumbsPerRow).addClass('invisible');

    App._thumbsNumber = $thumbs.length;



    $('.arrows .change').click(function(e) {
        var direction = $(e.target).closest('.change').is('.down');
        App._slideToPhoto(direction);
    });

    $('.thumbs').on('click', '.thumb', function(e) {
        var $target = $(e.target).closest('.thumb');
        var photoId = Number($target.data('id'));

        App._slideToPhoto(photoId);
    });

    $(document).keydown(function(e) {
        // FIXME!
        var isGallery = true;
        if (isGallery) {
            switch(e.which) {
            case 40:
                // go down
                App._slideToPhoto(true);
                break;
            case 38:
                // go up
                App._slideToPhoto(false);
                break;
            default:
                break;
            }
        }
    })
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

    App._initGallery();
};

jQuery(function($) {

    App.init();




});
