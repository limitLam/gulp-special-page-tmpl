var gulp = require("gulp");
var browserify = require("gulp-browserify");
var sass = require('gulp-sass');
var inject = require('gulp-inject');
var rename = require("gulp-rename");
var htmlbeautify = require('gulp-html-beautify');
var sequence = require('gulp-sequence');
var del = require('del');

var path = require("path");

var resolve = path.resolve;

var srcPath = resolve(__dirname, "src");
var distPath = resolve(__dirname, "dist");
var tempPath = resolve(__dirname, "temp");

//  js编译
gulp.task("script", function () {
    return gulp.src(resolve(srcPath, "script/index.js"))
        .pipe(browserify())
        .pipe(gulp.dest(tempPath));
});

//  sass编译
var compileSass = function (env) {
    return function () {
        return gulp.src(resolve(srcPath, `style/index.${env}.scss`))
            .pipe(sass().on("error", sass.logError))
            .pipe(rename('index.css'))
            .pipe(gulp.dest(tempPath));
    };
}

gulp.task('sass:dev', compileSass('dev'));

gulp.task('sass:pro', compileSass('pro'));

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
    del(['dist']);
});

//  在dist目录启用静态服务器
gulp.task('server', function () {
    var server = require('./server');
    return server();
});

/*--- 源码列表 start ---*/
var sources = {
    style: [resolve(srcPath, 'style/**/*'), '!' + resolve(srcPath, 'style/index.pro.scss')],
    script: resolve(srcPath, 'script/**/*'),
    html: resolve(srcPath, 'html/index.html'),
    tmpl: resolve(srcPath, 'tmpl/index.dev.html')
}
/*--- 源码列表 end ---*/

/*--- 监听 start ---*/
gulp.task('watch:sass', function () {
    var watcher = gulp.watch(sources.style);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        sequence('del:dist', 'sass:dev', 'inject:dev')(function () {
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
        sequence('del:dist', 'inject')(function () {
            console.log('Compile Finish.');
        });
    });
    return watcher;
});

gulp.task('watch', ['watch:sass', 'watch:script', 'watch:html', 'watch:tmpl']);
/*--- 监听 end ---*/

gulp.task('dev', sequence('del:dist', ['script', 'sass:dev'], 'inject:dev', 'server', 'watch'));

gulp.task('pro', sequence('del:dist', ['script', 'sass:pro'], 'inject:pro'));