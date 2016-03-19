var gulp = require('gulp')
var webpack = require('webpack')
var path = require('path')
var fs = require('fs')
var nodemon = require('nodemon')
var WebpackDevServer = require('webpack-dev-server')

// frontend

var frontendConfig = {
  devtool: 'source-map',
  debug: true,
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './frontend/index.js'
  ],
  output: {
    path: path.join(__dirname, 'frontend/build'),
    publicPath: 'http://localhost:3000/build',
    filename: 'frontend.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel'] }
    ]
  }
}

// backend

var nodeModules = fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1
  })

var backendConfig = {
  devtool: 'source-map',
  debug: true,
  entry: [
    'webpack/hot/signal.js',
    './backend/main.js'
  ],
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  node: {
    __dirname: true,
    __filename: true
  },
  externals: [
    function(context, request, callback) {
      var pathStart = request.split('/')[0]
      if (nodeModules.indexOf(pathStart) >= 0 && request != 'webpack/hot/signal.js') {
        return callback(null, "commonjs " + request)
      }
      callback()
    }
  ],
  recordsPath: path.join(__dirname, 'build/_records'),
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.HotModuleReplacementPlugin({ quiet: true }),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel'] }
    ]
  }
}

// tasks

function onBuild(done) {
  return function(err, stats) {
    if(err) {
      console.log('Error', err)
    }
    else {
      console.log(stats.toString())
    }

    if(done) {
      done()
    }
  }
}

gulp.task('frontend-build', function(done) {
  webpack(frontendConfig).run(onBuild(done))
})

gulp.task('frontend-watch', function() {
  new WebpackDevServer(webpack(frontendConfig), {
    publicPath: frontendConfig.output.publicPath,
    hot: true
  }).listen(3000, 'localhost', function (err, result) {
    if(err) {
      console.log(err)
    }
    else {
      console.log('webpack dev server listening at localhost:3000')
    }
  })

})

gulp.task('backend-build', function(done) {
  webpack(backendConfig).run(onBuild(done))
})

gulp.task('backend-watch', function(done) {
  var firedDone = false
  webpack(backendConfig).watch(100, function(err, stats) {
    const error = stats.compilation.errors[0]
    if(error){
      console.log('webpack err', error.message)
    }else{
      if(!firedDone) {
        firedDone = true
        done()
      }

      nodemon.restart()
    }
  })
})

gulp.task('build', ['frontend-build', 'backend-build'])
gulp.task('watch', ['frontend-watch', 'backend-watch'])

gulp.task('run', ['backend-watch', 'frontend-watch'], function() {
  nodemon({
    execMap: {
      js: 'node'
    },
    script: path.join(__dirname, 'build/backend'),
    ignore: ['*'],
    watch: ['foo/'],
    ext: 'noop'
  }).on('restart', function() {
    console.log('Patched!')
  })
})
