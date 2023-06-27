// Get things set up
// -------------------------------------------------------------------
    // Include Gulp
import gulp from 'gulp'
import fileinclude from 'gulp-file-include'
import htmlmin from 'gulp-htmlmin'
import sass from 'gulp-sass'
import ss from 'sass'
import autoprefixer from 'gulp-autoprefixer'
import cssmin from 'gulp-clean-css'
import rename from 'gulp-rename'
import concat from 'gulp-concat'
import imagemin from 'gulp-imagemin'
import gutil from 'gulp-util'
import plumber from 'gulp-plumber'
import size from 'gulp-size'
import bs from 'browser-sync'

const browserSync = bs.create()

const distDir = 'docs'

// Tasks
// -------------------------------------------------------------------
// Start server
function browser() {
    browserSync.init({
        server: {
            baseDir: distDir
        }
    });
}

function reload(done) {
    browserSync.reload();
    done();
}

// Notify on error with a beep
var onError = function(error) {
    console.log(gutil.colors.red(error.message));
    // https://github.com/floatdrop/gulp-plumber/issues/17
    this.emit("end");
    gutil.beep();
};

// HTML task
function html() {
    return gulp.src("src/html/*.html")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Set up HTML templating
        .pipe(fileinclude({
            prefix: "@@",
            basepath: "src/html"
        }))
        // Clean up HTML a little
        .pipe(htmlmin({
            removeCommentsFromCDATA: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            caseSensitive: true,
            minifyCSS: true
        }))
        // Where to store the finalized HTML
        .pipe(gulp.dest(distDir));
}

// CSS task
function css() {
    return gulp.src("src/scss/main.scss")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Compile Sass
        .pipe(sass(ss)({ style: "compressed", noCache: true }))
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(autoprefixer({
            browsers: ["last 2 versions"]
        }))
        // Minify CSS
        .pipe(cssmin())
        // Rename the file
        .pipe(rename("production.css"))
        // Show sizes of minified CSS files
        .pipe(size({ showFiles: true }))
        // Where to store the finalized CSS
        .pipe(gulp.dest(`${distDir}/css`));
}

// JS task
function js() {
    return gulp.src("src/js/**/*", { ignore: ['src/js/vendor/**/*' ]})
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Concatenate all JS files into one
        .pipe(concat("production.js"))
        // Where to store the finalized JS
        .pipe(gulp.dest(`${distDir}/js`));
}

function jsVendors() {
    return gulp.src("src/js/vendor/**/*")
        // Where to store the finalized JS
        .pipe(gulp.dest(`${distDir}/js/vendor`));
}

function favicon() {
    return gulp.src("src/img/favicon/**/*")
        // Where to store the finalized JS
        .pipe(gulp.dest(distDir));
}

// Image task
function images() {
    return gulp.src("src/img/**/*.+(png|jpeg|jpg|gif|svg)")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Minify the images
        .pipe(imagemin())
        // Where to store the finalized images
        .pipe(gulp.dest(`${distDir}/img`));
}

function watchAndBuild () {
    gulp.watch([
        "src/html/**/*",
        "src/scss/**/*",
        "src/js/**/*",
        "src/img/**/*.+(png|jpeg|jpg|gif|svg)"
    ], gulp.series([build, reload]));
}

export const build = gulp.parallel([
    html,
    css,
    js,
    jsVendors,
    images,
    favicon
]);

// Use default task to launch BrowserSync and watch all files
export default gulp.parallel([build, watchAndBuild, browser]);
