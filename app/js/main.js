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

    },
    {
        id: 'services',
        main: true,
        load: function() {
            if (!this.inited) {
                this.$node.find('.photo').click(function(e) {
                    var fragment = $(e.currentTarget).data('fragment');
                    location.hash = fragment;
                });

                this.inited = true;
            }

            this.$node.removeClass('transparent');

        }
    },

    {
        id: 'service',
        url: 'services/bouquets'
    },

    {
        id: 'about',
        load: function() {
            if (!this.inited) {

                //debugger;
                //$(".about__inner").mCustomScrollbar();
                this.inited = true;
            }

            this.$node.css('visibility', 'visible').find('.text')
                /*.bacon({
                    'type' : 'line',
                    'step' : 5,
                    'align' : 'right'
                })*/
                .end()
                .addClass('with-transition').removeClass('transparent');
        }
    }, {
        id: 'contacts'
    }
];

App.baseUrl = '!';

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
            $thumbs.removeClass('transparent').filter(selector).addClass('transparent');
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

    var height = $('.cover').height();
    var $thumb = $('.thumb:first');
    App._thumbHeight = $thumb.outerHeight() + parseInt($thumb.css('margin-top')) + parseInt($thumb.css('margin-bottom'));

    var $thumbs = $('.thumb');
    App._thumbsPerRow = Math.floor(height / App._thumbHeight);
    $thumbs.eq(App._thumbsPerRow).addClass('transparent');

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

    App._initPages();

    App._initGallery();
};

jQuery(function($) {
    App.init();
});
