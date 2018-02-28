var gulp = require("gulp");
var browserify = require("gulp-browserify");
var sass = require('gulp-sass');
var inject = require('gulp-inject');
var rename = require("gulp-rename");
var htmlbeautify = require('gulp-html-beautify');
var sequence = require('gulp-sequence');
var autoprefixer = require("gulp-autoprefixer");
var replace = require("gulp-replace");
var wait = require('gulp-wait');
var del = require('del');
var ftp = require('vinyl-ftp');
var gutil = require('gulp-util');
var config = require('./config');
var spritesmith = require('gulp.spritesmith');
var plumber = require('gulp-plumber');

var path = require("path");

var resolve = path.resolve;

var srcPath = resolve(__dirname, "src");
var distPath = resolve(__dirname, "dist");
var tempPath = resolve(__dirname, "temp");

var cdnPath = config.cdnPath;

//  js编译
gulp.task("script", function () {
    return gulp.src(resolve(srcPath, "script/index.js"))
        .pipe(browserify())
        .pipe(gulp.dest(tempPath));
});

//  sass编译
var compileSass = function () {
    return gulp.src(resolve(srcPath, `style/index.scss`))
        //  容错处理
        .pipe(plumber({
            errorHandler: function(error){
                this.emit('end');
            }
        }))
        //  sass文件读取兼容
        .pipe(wait(500))
        .pipe(sass({
            includePaths: [resolve(srcPath, 'style')]
        }).on("error", sass.logError))
        .pipe(autoprefixer("last 3 versions"))
        .pipe(rename('index.css'))
        .pipe(gulp.dest(tempPath));
}

gulp.task('sass', compileSass);

//  包裹
var wrap = function (ext, contents) {
    var content = "";
    switch (ext) {
        case 'css':
            content = '<style>' + contents + '</style>';
            break;
        case 'js':
            content = '<script>' + contents + '</script>';
            break;
        case 'html':
            content = contents;
            break;
        default:
            break;
    }
    // console.log(content);
    return content;
};

//  获取文件后缀名
var getExt = function (filePath) {
    var splitArr = filePath.split(".");
    return splitArr[splitArr.length - 1];
};

var injectTask = function (env) {
    return function () {
        var sources = [
            resolve(tempPath, 'index.css'),
            resolve(tempPath, 'index.js'),
            resolve(srcPath, 'html/index.html')
        ];

        return gulp.src(resolve(srcPath, `tmpl/index.${env}.html`))
            .pipe(inject(gulp.src(sources), {
                starttag: '<!-- inject:{{ext}} -->',
                transform: function (filePath, file) {
                    var ext = getExt(filePath);
                    // return file contents as string
                    return wrap(ext, file.contents.toString('utf8'));
                }
            }))
            .pipe(replace('@CDNPATH', cdnPath[env]))
            .pipe(rename('index.html'))
            .pipe(htmlbeautify({
                indent_size: 4
            }))
            .pipe(gulp.dest(distPath));
    }
}

//  代码注入流程
gulp.task('inject:dev', injectTask('dev'));

gulp.task('inject:pro', injectTask('pro'));


//  删除dist目录
gulp.task('del:dist', function () {
    del([distPath]);
});
//  删除雪碧图相关文件
gulp.task('del:sprite', function () {
    del([
        resolve(srcPath, "images/sprite.png"),
        resolve(srcPath, "style/sprite.scss")
    ]);
});


//  在dist目录启用静态服务器
gulp.task('server', function () {
    var server = require('./server');
    return server();
});

/*--- 源码列表 start ---*/
var sources = {
    sprite: resolve(srcPath, 'images/icon/**'),
    style: [
        resolve(srcPath, 'style/**/*'),
        '!' + resolve(srcPath, 'style/sprite.scss')
    ],
    script: resolve(srcPath, 'script/**/*'),
    html: resolve(srcPath, 'html/index.html'),
    tmpl: resolve(srcPath, 'tmpl/index.dev.html')
}
/*--- 源码列表 end ---*/

/*--- 监听 start ---*/
gulp.task('watch:sprite', function () {
    return gulp.watch(sources.sprite, {
        events : 'all'
    },function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        sequence('del:dist', 'del:sprite', 'sprite', 'sass', 'inject:dev')(function () {
            console.log('Compile Finish.');
        });
    });
});

gulp.task('watch:sass', function () {
    var watcher = gulp.watch(sources.style);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        sequence('del:dist', 'sass', 'inject:dev')(function () {
            console.log('Compile Finish.');
        });
    });
    return watcher;
});

gulp.task('watch:script', function () {
    var watcher = gulp.watch(sources.script);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        sequence('del:dist', 'script', 'inject:dev')(function () {
            console.log('Compile Finish.');
        });
    });
    return watcher;
});

gulp.task('watch:html', function () {
    var watcher = gulp.watch(sources.html);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        sequence('del:dist', 'inject:dev')(function () {
            console.log('Compile Finish.');
        });
    });
    return watcher;
});

gulp.task('watch:tmpl', function () {
    var watcher = gulp.watch(sources.tmpl);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        sequence('del:dist', 'inject:dev')(function () {
            console.log('Compile Finish.');
        });
    });
    return watcher;
});

gulp.task('watch', ['watch:sprite', 'watch:sass', 'watch:script', 'watch:html', 'watch:tmpl']);
/*--- 监听 end ---*/

/*--- cdn upload start ---*/
var remotePath = config.proCdn.route;

gulp.task('cdn', function () {

    const conn = ftp.create({
        host: '61.135.251.132',
        port: '16321',
        user: 'gzlinminyi',
        pass: 'abc123@#',
        secure: true,
        secureOptions: {
            rejectUnauthorized: false
        },
        log: gutil.log
    });

    return gulp.src([
            resolve(srcPath, "images/**"),
            "!" + resolve(srcPath, "images/icon/"),
        ], {
            base: `./src/images`,
            buffer: false
        })
        .pipe(conn.newer(remotePath)) // only upload newer files
        .pipe(conn.dest(remotePath));
});
/*--- cdn upload end ---*/

/*--- sprite start ---*/
gulp.task('sprite', function () {
    var spriteData = gulp.src(resolve(srcPath, "images/icon/**.png")).pipe(spritesmith({
        imgName: 'images/sprite.png',
        cssName: 'style/sprite.scss',
        imgPath: '@CDNPATH/sprite.png',
        cssFormat: 'sass_retina',
        cssTemplate: resolve(srcPath, 'handlebar/sprite.sass.handlebars')
    }));
    return spriteData.pipe(gulp.dest(srcPath));
});
/*--- sprite end ---*/

gulp.task('dev', sequence('del:dist', 'del:sprite', 'sprite', ['script', 'sass'], 'inject:dev', 'server', 'watch'));

gulp.task('pro', sequence('del:dist', 'del:sprite', 'sprite', ['script', 'sass'], 'inject:pro', 'cdn'));