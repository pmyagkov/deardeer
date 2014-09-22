var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var include = require('gulp-file-include');
var debug = require('gulp-debug');
var autoprefixer = require('gulp-autoprefixer');
var imageResize = require('gulp-image-resize');
var newer = require('gulp-newer');
var rename = require('gulp-rename');
var glob = require('glob');
var _ = require('lodash');
var borschik = require('gulp-borschik');
var through = require('through');
var through2 = require('through2');


var path = require('path');
var fs = require('fs');

var q = require('q');
/*
gulp.task('upload', function () {
    var privateKey = fs.readFileSync('/Users/viking/.ssh/id_rsa');

    return gulp.src(paths.build.dir)
        .pipe(scp({
            host: 'deardeerart.ru',
            username: 'root',
            dest: '/var/www/deardeerart/',
            privateKey: privateKey,
            passphrase: 'Sid$Civilization'
        }))
        .on('error', function(err) {
            console.log(err);
        });
});*/

var paths = {
    'js': { dir: 'app/js/', glob: 'app/js/*.js', build: 'app/.build/js' },
    'lib': { dir: 'app/js/lib/', glob: 'app/js/lib/*.js', build: 'app/.build/js' },
    'styl': { dir: 'app/styl/', glob: 'app/styl/*.styl', build: 'app/.build/styl' },
    'jade': {
        dir: 'app/jade/', glob: 'app/jade/wrappers/*.jade', build: 'app/.build',
        pages: {
            glob: 'app/jade/pages/*.jade',
            dir: 'app/jade/pages/',
            htmlGlob: 'app/jade/pages/*.html'
        }
    },
    'photos': { dir: 'app/images/photos/', glob: 'app/images/photos/*.jpg'},
    'images': { dir: 'app/images/', glob: 'app/images/**/*', build: 'app/.build/images'},
    'build': { dir: 'app/.build/', glob: 'app/.build/*'}

};

function resize(width, height, basename) {
    var resizeOptions = {
        width: width,
        height: height,
        crop: false,
        upscale: false
    };

    return gulp.src(paths.photos.dir + '*/original.jpg')
        .pipe(imageResize(resizeOptions))
        .pipe(rename(function(path) {
            path.basename = basename;
        }))
        .pipe(gulp.dest(paths.photos.dir));
}

var readdir = q.denodeify(fs.readdir);
var writeFile = q.denodeify(fs.writeFile);
var readFile = q.denodeify(fs.writeFile);
var stat = q.denodeify(fs.stat);

var writeError = function(err) {
    console.error(err);
};

function processPhotoStat(filePath, stat) {
    //console.log('Processing photo stat');

    var result = {};

    if (stat && stat.isFile()) {
        var ext = path.extname(filePath);
        //console.log('ext: ' + ext);
        // это картинка?
        if (/\.jpeg|jpg|png/.test(ext)) {
            var fileName = path.basename(filePath, ext);
            result[fileName] = filePath;

        } else {
            console.error(filePath + ' is not an image!');
        }

    } else {
        console.error(filePath + ' is not a file!');
    }

    //console.log('resultObj: ' + JSON.stringify(result));

    return result;
}

function extractPhotoDirectory(promoDir) {
    //console.log('extracting photo directory');

    return readdir(promoDir).then(function(list) {
        var photosDef = q.defer();

        var photosObj = {};

        var deferreds = list.map(function(file) {
            var filePath = path.join(promoDir, file);
            return stat(filePath).then(function(stat) {
                var def = q.defer();

                _.extend(photosObj, processPhotoStat(filePath, stat));
                def.resolve();

                return def.promise;
            });
        }, writeError);

        q.all(deferreds).done(function() {
            //console.log('photosObj: ' + JSON.stringify(photosObj));
            photosDef.resolve(photosObj);
        });

        return photosDef.promise;

    }, writeError);
}

gulp.task('photos.json', function() {

    return readdir(paths.photos.dir).then(function(list) {
        var foldersDef = q.defer();

        var foldersArr = [];

        var deferreds = list.map(function(file) {
            var folderDef = q.defer();

            var filePath = path.join(paths.photos.dir, file);
            stat(filePath).then(function(stat) {
                if (stat && stat.isDirectory()) {
                    extractPhotoDirectory(filePath).then(function(obj) {
                        foldersArr.push(obj);

                        folderDef.resolve();
                    });
                } else {
                    console.log(filePath + ' is not a dir');

                    folderDef.resolve();
                }
            });

            return folderDef.promise;
        });

        q.all(deferreds).done(function() {
            var jsoned = JSON.stringify(foldersArr);
            //console.log('foldersArr: ' + jsoned);

            writeFile(path.join(paths.photos.dir, 'photos.json'), jsoned).then(function() {
                foldersDef.resolve();
                //console.log('photos.json written');
            }, writeError);
        });

        return foldersDef.promise;
    }, writeError);

});

gulp.task('lib', function() {
    var libs = [
        'app/bower_components/jquery/dist/jquery.min.js',
        'app/bower_components/es5-shim/es5-shim.min.js',
        'app/bower_components/lodash/dist/lodash.min.js',
        'app/js/lib/finch.min.js',
        'app/js/lib/bacon.jquery.js'
    ];

    return gulp.src(libs)
        .pipe(newer(path.join(paths.js.build, 'lib', 'lib.js')))
        //.pipe(borschik({tech: 'js', minimize: false}))
        .pipe(concat('lib.js'))
        .pipe(gulp.dest(path.join(paths.js.build, 'lib')));
});

gulp.task('js', ['lib', 'photos.json'], function() {
    return gulp.src(paths.js.glob)
        .pipe(borschik({minimize: false, tech: 'js'}))
        /*.pipe(rename(function(path) {
            path.basename = "_main";
        }))*/
        .pipe(gulp.dest(paths.js.build));
});

gulp.task('images', function() {
     return gulp.src(paths.images.glob)
         .pipe(gulp.dest(paths.images.build));
});

gulp.task('normalize', function() {

    glob(paths.photos.glob, {debug: false}, function (er, files) {
        files.forEach(function(file, i) {
            //var basename = path.basename(file, '.jpg');
            var dirPath = path.join(paths.photos.dir, (i + 1).toString());
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }

            // moving files
            fs.renameSync(file, path.join(dirPath, 'original.jpg'));
        });
    });
});


gulp.task('test2', function() {
    var def = q.defer();

    def.promise.then(function() {
        var def2 = q.defer();

        setTimeout(function() {
            def2.resolve([1, 2]);
        }, 3000);

        return def2.promise;
    }).then(function(a) {
         console.log('a: ' + JSON.stringify(a));
    });

    def.resolve();

});

gulp.task('thumbs', function() {
    resize(150, 100, 'thumb');
});

gulp.task('big', function() {
    resize(1920, 1680, '1920x1680');
});

gulp.task('fonts', function() {
    return gulp.src(path.join(paths.styl.dir, 'fonts/*'))
        .pipe(gulp.dest(path.join(paths.styl.build, 'fonts/')));
});

gulp.task('css', ['photos.json', 'fonts'], function() {
    var photos = getPhotosJson();

    return gulp.src(paths.styl.glob)
        .pipe(stylus({
            define: {
                '$photos_count': photos.length
            }
        }).on('error', function(err) {console.error(err);}))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.styl.build));

});


function getPhotosJson() {
    return JSON.parse(fs.readFileSync(path.join(paths.photos.dir, 'photos.json'), {encoding: 'utf-8'}));
}

gulp.task('html', function() {
    return gulp.src(paths.jade.dir + 'index.jade')
        .pipe(jade())
        .pipe(gulp.dest('app/.build/'));
});

gulp.task('templates', function() {
    function modify() {
        function transform(file, enc, callback) {
            if (!file.isBuffer()) {
                this.push(file);
                callback();
                return;
            }
            var funcName = path.basename(file.path, '.js');
            var from = 'function template(locals) {';
            var to = 'function ' + funcName + '(locals) {';
            var contents = file.contents.toString().replace(from, to);
            file.contents = new Buffer(contents);
            this.push(file);
            callback();
        }
        return through2.obj(transform);
    }

    return gulp.src(paths.jade.dir + 'pages/*.jade')
        .pipe(jade({client: true}))
        .pipe(modify())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest(paths.js.build));
});

gulp.task('markup', ['images', 'js', 'css', 'html']);

gulp.task('watch', function() {
    var photosWatchGlob = [paths.photos.dir + '/*', paths.photos.dir + '/**/*', '!' + paths.photos.dir + '/photos.json'];

    gulp.watch(paths.js.glob, ['js']);
    gulp.watch(paths.lib.glob, ['lib']);
    gulp.watch(paths.styl.glob, ['css']);
    gulp.watch([paths.jade.pages.glob, 'app/images/*.svg'], ['markup']);
    gulp.watch(photosWatchGlob, ['js', 'markup']);
    // здесь нужно перезапускать процесс gulp'a по изменению gulpfile
    //gulp.watch('gulpfileza.js', ['default']);
});

gulp.task('favicon', function() {
    return gulp.src('app/favicon.ico')
        .pipe(gulp.dest(paths.build.dir));
});

gulp.task('rpm', ['markup', 'js', 'css', 'favicon']);

gulp.task('default', ['markup', 'js', 'css', 'watch']);
