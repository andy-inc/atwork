_require = require 'a.require'
$MongoClient = require('mongodb').MongoClient
$http = require('http')
$express = require('express')
$MongoStore = require('connect-mongo')($express)
$lessMiddleware = require('less-middleware')
$glob = require('glob')
$async = require('async')

_config = _require './config'
_env = _require './env'
_userModel = _require './models/user'

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

  app.use middlewares.rewriteUrls

  app.use app.router

  app.use '/static', $lessMiddleware({src: _require.path('../client'), compress: false})

  app.use '/static', $express.static(_require.path('../client'))

  app.use (req, res, next)->
    res.status 404
    res.sendfile _require.path('../client/E404.html')

  app.use (err, req, res, next)->
    console.error err
    next(err)

  app.use (err, req, res, next)->
    if req.isAPI
      res.send(500, {message: err.message || "Unknown error", code: err.code || 0})
    else
      res.status(500)
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
  #Check autorization
  checkAuth: (req, res, next)->
    #Allow display login page for all methods
    if req.url in ['/auth/login', '/login.html', '/static/login.html'] or req.isStatic
      next()
      return

    if req.session.email?
      next()
    else if not req.isAPI
      res.redirect(307, '/auth/login')
    else
      res.send(401, {message: "Unauthorized", code: 401})

  #Load current user
  loadUser: (req, res, next)->
    _userModel.get req.session.email, (err, user)->
      if err
        console.error err
        next err
      else if not user?
        delete req.session
        middlewares.checkAuth(req, res, next)
      else
        req.user = user
        next()

  #Rewrite urls
  rewriteUrls: (req, res, next)->
    req.isAPI = req.url.indexOf('/api') > -1
    req.isStatic = req.url.indexOf('/static') > -1
    if not req.isAPI
      if req.url == '/auth/login'
        req.url = '/static/login.html'
      else if not req.isStatic
        req.url = '/index.html'
    next()