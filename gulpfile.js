var gulp = require('gulp'),
    sass = require('gulp-sass'),
    inject = require('gulp-inject'),
    debug = require('gulp-debug'),
    concat = require('gulp-concat'),
    shell = require('gulp-shell'),
    cleanCss = require('gulp-clean-css'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    del = require('del');


// JSPM
gulp.task('jspm:bundle:dev', ['clean:bundle'], shell.task([
    'jspm bundle-sfx assets/index dist/production.min.js --inject'
]));

gulp.task('jspm:bundle:prod', ['clean:bundle'], shell.task([
    'jspm bundle-sfx assets/index dist/production.min.js --minify --skip-source-maps --inject'
]));


// FONTS
gulp.task('fonts', ['clean:fonts'], function () {
    //bundle FA fonts
    return gulp.src([
        './jspm_packages/npm/font-awesome@4.4.0/fonts/**',
        './jspm_packages/github/twbs/bootstrap-sass@3.3.7/assets/fonts/**',
        './assets/fonts/**'
    ])
        .pipe(gulp.dest('./dist/fonts'));
});


// SASS
gulp.task('sass', ['clean:sass'], function () {
    return gulp.src(['./assets/styles/app.scss', './assets/styles/ext-fonts.scss'])
        .pipe(inject(gulp.src(['./**/js/**/*.scss']), {
            transform: function (filename) {
                return '@import "../..' + filename + '";';
            }
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCss())
        .pipe(concat('production.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./**/**/**/*.scss', ['sass', 'vars:dev']);
});


//IMAGES
gulp.task('images', ['clean:images'], function () {
    return gulp.src(['./assets/images/**'])
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('./dist/assets/images'));
});


//TIMESTAMP
gulp.task('vars:dev', function () {
    gulp.src(['./assets/index.tpl.html'])
        .pipe(replace(/%TIMESTAMP%/g, new Date().getTime()))
        .pipe(replace(/%STRIPE_KEY%/g,''))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./dist'));
});
gulp.task('vars:prod', function () {
    gulp.src(['./assets/index.tpl.html'])
        .pipe(replace(/%TIMESTAMP%/g, new Date().getTime()))
        .pipe(replace(/%STRIPE_KEY%/g,''))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./dist'));
});


//VARS
gulp.task('bundle:dev', ['jspm:bundle:dev'], function () {

    gulp.src(['./dist/production.min.js'])
        .pipe(replace(/%API_SERVER%/g, 'qa.test.com'))
        .pipe(gulp.dest('./dist'));
    gulp.src(['./assets/js/**'])
        .pipe(gulp.dest('./dist/assets/js'));

});

gulp.task("bundle:dev:watch", () => {
    gulp.watch("./assets/**/**/*.js", ["bundle:dev"]);
gulp.watch("./assets/*.js", ["bundle:dev"]);
});

gulp.task('bundle:prod', ['jspm:bundle:prod'], function () {
    gulp.src(['./dist/production.min.js'])
        .pipe(replace(/%API_SERVER%/g, 'qa.test.com'))
        .pipe(gulp.dest('./dist'));
});


// DEFAULT
gulp.task('default', [
    'images',
    'vars:dev',
    'bundle:dev',
    'fonts',
    'sass'
]);


// BUILD DEV
gulp.task('build:dev', [
    'images',
    'vars:dev',
    'fonts',
    'bundle:dev',
    'sass',
    // 'sass:watch',
    'bundle:dev:watch'
]);


// BUILD PRODUCTION
gulp.task('build:prod', [
    'images',
    'vars:prod',
    'fonts',
    'bundle:prod',
    'sass'
]);


//CLEAN
gulp.task('clean:bundle', function () {
    return del(['./dist/production.min.js', './dist/production.min.js.map'])
});

gulp.task('clean:sass', function () {
    return del(['./dist/production.css'])
});

gulp.task('clean:fonts', function () {
    return del(['./dist/fonts/**'])
});

gulp.task('clean:images', function () {
    return del(['./dist/assets/images/**'])
});