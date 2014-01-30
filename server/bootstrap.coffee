_require = require 'a.require'
$MongoClient = require('mongodb').MongoClient
$http = require('http')
$express = require('express')
$MongoStore = require('connect-mongo')($express)
$glob = require('glob')
$async = require('async')

_config = _require './config'
_env = _require './env'

#Start Application
exports.start = (cb)->
  $async.waterfall [
    exports.db
    exports.server
  ], cb

#Connect to mongodb
exports.db = (cb)->
  $async.waterfall [
    (cb)-> $MongoClient.connect _config.db.url, cb
    (db, cb)->
      _env.set 'db', db
      $glob __dirname + '/models/**/*.js', cb
    (files, cb)->
      db = _env.get 'db'
      $async.each files,
        (file, next)-> require(file).init(db, next)
      , cb

  ], cb

#Start http server
exports.server = (cb)->

  app = $express()

  #Configure Expressjs
  app.use $express.methodOverride()
  app.use $express.urlencoded()

  app.use $express.cookieParser()
  app.use $express.session
    secret: _config.server.secret
    store: new $MongoStore({url: _config.db.url + "/sessions"})
    cookie: _config.server.cookie

  app.use $express.json()

  app.use $express.logger() if 'development' == app.get 'env'
  app.use app.router
  app.use $express.static(_require.path('../client'))

  app.use (req, res, next)->
    res.status 404
    res.sendfile _require.path('../client/E404.html')

  app.use (err, req, res, next)->
    console.error err
    next(err)

  app.use (err, req, res, next)->
    if req.isAPI
      res.send(500, err.message || "Unknown error")
    else
      res.status(500);
      res.sendfile _require.path('../client/E500.html')


  #Add routes
  app.all "*", middlewares.checkAuth
  app.all "/api/*", middlewares.loadUser

  #Start HTTP Server
  $http
  .createServer(app)
  .listen _config.server.port, _config.server.host, (err)->
    console.log "Stat on http://#{_config.server.host}:#{_config.server.port}" if not err?
    cb(err)

middlewares =
  checkAuth: (req, res, next)->
    next()
  loadUser: (req, res, next)->
    next()