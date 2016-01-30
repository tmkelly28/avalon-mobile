var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var runSeq = require('run-sequence');
var notify = require('gulp-notify');
var eslint = require('gulp-eslint');
var sh = require('shelljs');

var paths = {
    sass: ['./scss/**/*.scss']
};

gulp.task('default', ['buildCSS', 'buildJS']);

gulp.task('reload', function () {
    livereload.reload();
});

gulp.task('reloadCSS', function () {
    return gulp.src('./scss/ionic.app.scss').pipe(livereload());
});

gulp.task('buildCSS', function (done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/build/'))
        .on('end', done);
});

gulp.task('lintJS', function () {

    return gulp.src(['./browser/js/**/*.js', './server/**/*.js'])
        .pipe(plumber({
            errorHandler: notify.onError('Linting FAILED! Check your gulp process.')
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());

});

gulp.task('buildJS', ['lintJS'], function () {
    return gulp.src(['./www/js/app.js', './www/js/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .on('error', console.error.bind(console))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./www/build'));
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
});

// gulp.task('install', ['git-check'], function () {
//     return bower.commands.install()
//         .on('log', function (data) {
//             gutil.log('bower', gutil.colors.cyan(data.id), data.message);
//     });
// });

// gulp.task('git-check', function (done) {
//     if (!sh.which('git')) {
//         console.log(
//           '  ' + gutil.colors.red('Git is not installed.'),
//           '\n  Git, the version control system, is required to download Ionic.',
//           '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
//           '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
//         );
//         process.exit(1);
//     }
//     done();
// });

// Production tasks
// --------------------------------------------------------------

gulp.task('buildCSSProduction', function () {
    return gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .pipe(rename('style.css'))
        .pipe(minifyCSS())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/build/'))
});

gulp.task('buildJSProduction', function () {
    return gulp.src(['./www/js/app.js', './www/js/**/*.js'])
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('./www/build'))
});

gulp.task('buildProduction', ['buildCSSProduction', 'buildJSProduction']);

// Composed tasks
// --------------------------------------------------------------

gulp.task('build', function () {
    if (process.env.NODE_ENV === 'production') {
        runSeq(['buildJSProduction', 'buildCSSProduction']);
    } else {
        runSeq(['buildJS', 'buildCSS']);
    }
});

gulp.task('default', function () {
    gulp.start('build');

    // Run when anything inside of www/js changes.
    gulp.watch('www/js/**', function () {
        runSeq('buildJS', 'reload');
    });

    // Run when anything inside of /scss changes.
    gulp.watch('scss/**', function () {
        runSeq('buildCSS', 'reloadCSS');
    });

    gulp.watch('server/**/*.js', ['lintJS']);

    // Reload when a template (.html) file changes.
    gulp.watch(['www/**/*.html', 'server/app/views/*.html'], ['reload']);

    livereload.listen();

});
