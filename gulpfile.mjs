import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';  // Import Dart Sass
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import imagemin from 'gulp-imagemin';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import fileInclude from 'gulp-file-include';
import htmlmin from 'gulp-htmlmin';
import browserSync from 'browser-sync'; // Import browser-sync
import eslint from 'gulp-eslint-new';

// Use Dart Sass with gulp-sass
const sass = gulpSass(dartSass);

// Create a BrowserSync instance
const server = browserSync.create();

// Paths
const paths = {
  styles: { src: 'src/scss/**/*.scss', dest: 'dist/css/' }, // Entry point SCSS file
  scripts: { src: 'src/js/**/*.js', dest: 'dist/js/' },
  images: { src: 'src/images/**/*', dest: 'dist/images/' },
  html: { src: ['src/html/**/*.html'], dest: 'dist/' }
};

// Tasks
function styles() {
  return gulp.src('src/scss/style.scss') // Entry point
    .pipe(sass().on('error', sass.logError)) // Use sass instead of sassCompiler
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream()); // Inject CSS changes without page reload
}

function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(server.stream()); // Reload browser on JS changes
}

function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(server.stream()); // Reload browser on image changes
}

function html() {
  return gulp.src('src/html/templates/*.html')
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(server.stream()); // Reload browser on HTML changes
}

// ESLint task
function lint() {
  return gulp.src(['src/js/*.js'])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.fix())
    .pipe(eslint.format())
    // .pipe(eslint.failAfterError());
    .pipe(eslint.formatEach('compact', process.stderr));
}

// Serve files with BrowserSync
function serve(done) {
  server.init({
    server: {
      baseDir: './dist'
    },
    port: 3000  // You can change the port if needed
  });
  done();
}

// Reload browser on file changes
function reload(done) {
  server.reload();
  done();
}

// Watch files and reload browser on changes
function watch() {
  gulp.watch(paths.styles.src, styles); // Watch entry point SCSS file
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload)); // Reload for JS
  gulp.watch(paths.images.src, gulp.series(images, reload)); // Reload for images
  gulp.watch(paths.html.src, gulp.series(html, reload)); // Reload for HTML
}

// Define build and default tasks
const build = gulp.series(gulp.parallel(styles, scripts, images, html, lint));
const dev = gulp.series(build, serve, watch); // Start the server in development mode

// Export tasks
export { styles, scripts, images, html, watch, build };
export default dev;
