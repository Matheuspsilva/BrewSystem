// -----------------------------------------------------------------------------
// File system builder
// -----------------------------------------------------------------------------
 
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const htmlmin = require('gulp-htmlmin');
const cleancss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const gzip = require('gulp-gzip');
const del = require('del');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const inlinesource = require('gulp-inline-source');
 
/* Clean destination folder */
gulp.task('clean', function() {
    return del(['dist/*']);
});
 
/* Process HTML, CSS, JS */
gulp.task('html', function() {
  return gulp.src('./*.html')
      .pipe(useref())
      .pipe(plumber())
      .pipe(inlinesource())
      .pipe(gulpif('*.css', cleancss()))
      .pipe(gulpif('*.js', uglify()))
      .pipe(gulpif('*.html', htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: false
      })))
      .pipe(gzip())
      .pipe(gulp.dest('dist'));
});
 
/* Build file system */
gulp.task('buildfs', gulp.series('clean','html'));
gulp.task('default', gulp.series('buildfs'));
 
// -----------------------------------------------------------------------------
// PlatformIO support
// -----------------------------------------------------------------------------
 
const spawn = require('child_process').spawn;
const argv = require('yargs').argv;
 
var platformio = function(target) {
    var args = ['run'];
    if ("e" in argv) { args.push('-e'); args.push(argv.e); }
    if ("p" in argv) { args.push('--upload-port'); args.push(argv.p); }
    if (target) { args.push('-t'); args.push(target); }
    const cmd = spawn('platformio', args);
    cmd.stdout.on('data', function(data) { console.log(data.toString().trim()); });
    cmd.stderr.on('data', function(data) { console.log(data.toString().trim()); });
}
 
 gulp.task('uploadfs', gulp.series('buildfs', function() { platformio('uploadfs'); }));
 gulp.task('upload', function() { platformio('upload'); });
 gulp.task('run', function() { platformio(false); });