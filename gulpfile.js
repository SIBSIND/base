var gulp = require('gulp');
postcss = require('gulp-postcss');
autoprefixer = require('gulp-autoprefixer');
sourcemaps = require('gulp-sourcemaps');
atImport = require('postcss-import');
postCSS_InlineComment = require('postcss-inline-comment');
cssnext = require('postcss-cssnext');
sorting = require('postcss-sorting');
nested = require('postcss-nested');
pxtorem = require('postcss-pxtorem');
uglify = require('gulp-uglify');
newer = require('gulp-newer');
rename = require('gulp-rename');
nano = require('gulp-cssnano');
notify = require("gulp-notify");
stylelint = require('stylelint');
reporter = require('postcss-reporter');

var imgSrc = './src/img/*';
var imgDist = './img';
var jsSrc = './src/js/*.js';
var jsDist = './js';


//Notificando errores de JavaScript
function errorAlertJS(error) {
  notify.onError({
    title: "Gulp JavaScript",
    subtitle: "Algo esta mal en tu JavaScript!",
    sound: "Basso"
  })(error);
  console.log(error.toString());
  this.emit("end");
};


//Notificando errores de CSS
function errorAlertPost(error) {
  notify.onError({
    title: "Gulp postCSS",
    subtitle: "Algo esta mal en tu CSS!",
    sound: "Basso"
  })(error);
  console.log(error.toString());
  this.emit("end");
};

//Comprimiendo JavaScript
gulp.task('compress', function() {
  return gulp.src(jsSrc)
    .pipe(uglify())
    .on("error", errorAlertJS)
    .pipe(gulp.dest(jsDist))
    .pipe(notify({
      message: 'JavaScript complete'
    }));
});


//Lanzando postCSS. El orden de los plugins debe ser respetado
gulp.task('css', function() {
  var processors = [
    atImport,
    stylelint(),
    reporter({
      clearMessages: true
    }),
    nested,
    cssnext,
    pxtorem({
      root_value: 16,
      unit_precision: 2,
      prop_white_list: ['font', 'font-size', 'line-height', 'letter-spacing', 'margin', 'padding'],
      replace: true,
      media_query: false
    }),
    sorting({
      "sort-order": "csscomb"
    }),
    autoprefixer
  ];
  return gulp.src('./src/css/styles.css')

  .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .on("error", errorAlertPost)
    .pipe(sourcemaps.write('./css', {
      sourceRoot: '/src'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(notify({
      message: 'postCSS complete'
    }));
});

//Lanzando CSSnano para comprimir CSS
gulp.task('minify', function() {
  return gulp.src('./css/styles.css')
    .pipe(nano())
    .pipe(gulp.dest('./css'))
    .pipe(notify({
      message: 'CSSnano task complete'
    }));
});

//Comprimiendo imagenes
gulp.task('imagemin', function() {
  return gulp.src(imgSrc)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(imgDist));
});



gulp.task('images', function() {
  return gulp.src(imgSrc)
    .pipe(newer(imgDist))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDist));
});

//Tarea por defecto para compilar CSS y comprimir imagenes
gulp.task('default', function() {
  gulp.watch('./src/css/*.css', ['css']);
  gulp.watch('./src/img/**', ['images']);
});

//Tarea final para comprimir CSS y JavaScript
gulp.task('build', ['minify', 'compress']);
