var	 gulp = require('gulp');
var p = require('gulp-load-plugins')();
var vinylpaths = require('vinyl-paths');
var del = require('del');

var tsProject = p.typescript.createProject('tsconfig.json');

var typeScriptFilesGlob = ['*/src/**/*.ts'];

gulp.task('tsc', function () {
	return tsProject.src()
	    .pipe(p.sourcemaps.init())
        .pipe(tsProject())
        .js
		.pipe(p.sourcemaps.write('.'))
		.pipe(gulp.dest(function (f) {			
			return f.base; 
		}));
});
gulp.task('creategsajs',['tsc'],function(){    
	gulp.src('**/*.clientjs.js')
	.pipe(p.filelog())
	.pipe(vinylpaths(del))
	.pipe(p.each(function(content, file, callback) {
		var newContent = '<script type="text/javascript"> \n' + content+ '\n</script>'; 
		callback(null, newContent);
	}))
	
	.pipe(p.extReplace('.html'))	
	.pipe(gulp.dest(function (f) {			
		return f.base; 
	}));	
});


gulp.task('watch', function(){
	gulp.watch(typeScriptFilesGlob, defaultTaskSpec);
});

var defaultTaskSpec = ['tsc','creategsajs'];
gulp.task('default', defaultTaskSpec);
