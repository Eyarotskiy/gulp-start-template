const gulp = require('gulp');
const concat = require('gulp-concat');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const htmlreplace = require('gulp-html-replace');
const rename = require("gulp-rename");

const lessFiles = [
	'./app/styles/less/**/*.less',
	'!./app/styles/styles.less',
];
const jsFiles = [
	'./app/libs/jquery/**/*.js',
	'./app/libs/**/*.js',
	'./app/js/**/*.js',
	'!./app/js/**/scripts.js'
];

function styles() {
	return gulp.src('./app/styles/styles.less')
		.pipe(less())
		.pipe(concat('styles.min.css'))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(gulp.dest('./app/styles'))
		.pipe(browserSync.stream());
}

function scripts() {
	return gulp.src(jsFiles)
		.pipe(concat('scripts.js'))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(gulp.dest('./app/js'))
		.pipe(browserSync.stream());
}

function watch() {
	browserSync.init({
		server: {
			baseDir: "app"
		}
	});

	gulp.watch(lessFiles, styles);
	gulp.watch(jsFiles, scripts);
	gulp.watch('./app/**/*.html').on('change', browserSync.reload);
}

function buildFiles() {
	return gulp.src([
		'./app/**/*.+(ttf|otf|woff|eot)',
		'./app/**/styles.min.css',
		'./app/**/*.html',
		'!./app/index.html',
	])
		.pipe(gulp.dest('./dist'));
}

function buildImages() {
	return gulp.src([
		'./app/img/**/*.+(jpg|png|gif|svg)'
	])
		.pipe(imagemin())
		.pipe(gulp.dest('./dist/img'));
}

function buildScripts() {
	return gulp.src('./app/js/scripts.js')
		.pipe(uglify({toplevel: true}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./dist/js'));
}

function replaceScripts() {
	return gulp.src('./app/index.html')
		.pipe(htmlreplace({
			'js': 'js/scripts.min.js'
		}))
		.pipe(gulp.dest('./dist'));
}

function clean() {
	return del(['dist/*'])
}

gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('watch', watch);
gulp.task('default', gulp.series(
	gulp.parallel(styles, scripts),
	watch
));

gulp.task('build', gulp.series(
	clean,
	gulp.parallel(styles, scripts),
	buildScripts,
	replaceScripts,
	buildFiles,
	buildImages
));
