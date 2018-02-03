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

gulp.task("script", function () {
    return gulp.src(resolve(srcPath, "script/index.js"))
        .pipe(browserify())
        .pipe(gulp.dest(distPath));
});

gulp.task('sass', function () {
    return gulp.src(resolve(srcPath, "style/index.scss"))
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest(distPath));
});

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

gulp.task('inject', function () {
    var sources = [
        resolve(distPath, 'index.css'), 
        resolve(distPath, 'index.js'), 
        resolve(srcPath, 'html/index.html')
    ];

    return gulp.src(resolve(srcPath, 'tmpl/index.dev.html'))
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
});

gulp.task('del:dist',function(){
    del(['dist']);
});

gulp.task('clean',function(){
    del([
        'dist/**/*',
        '!dist/**.html'
    ]);
});

gulp.task('build', sequence('del:dist',['script','sass'],'inject','clean'));