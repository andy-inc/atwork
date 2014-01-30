_require = require 'a.require'
$async = require 'async'
$bcrypt = require 'bcrypt'

_config = _require './config'

#User collection in mongo
collection = null

#Init user model
exports.init = (db, cb)->
  collection = db.collection 'user'

  $async.each _config.db.users, (user, next)->

    $async.waterfall [
      (cb)-> exports.exists user.email, cb
      (exists, cb) ->
        if exists
          cb()
        else
          exports.create user.email, user.password, {allow: user.allow}, cb
    ], next


  , (err)->
    console.log 'Init user model' if not err?
    cb(err)


#User exists check
exports.exists = (email, cb) ->
  collection.count {email: email}, (err, count = 0)-> cb(err, count > 0)


#Create user
exports.create = (email, password, options, cb)->
  $async.waterfall [
    (cb) -> cryptPassword password, cb
    (password, cb) ->
      user =
        email: email
        password: password
        fio: email
        alias: "NO-ALIAS"
        allow: ['user']
      for key, value of options
        user[key] = value

      collection.insert user, (err, result = [])->
        cb err, result[0]
  ], cb

#Find user
exports.get = (email, cb)-> collection.findOne {email: email}, cb

#Find user by email password
exports.find = (email, password, cb)->
  user = null
  $async.waterfall [
    (cb) -> exports.get email, cb
    (result, cb) ->
      if not result?
        cb {message: "User not found #{email}", code: 100}
      else
        user = result
        comparePassword password, user.password, cb
    (allow, cb)->
      if not allow
        cb {message: "User or password not correct", code: 101}
      else
        cb null, user
  ], cb

#Gen crypt password with salt
cryptPassword = (password, cb) ->
  $async.waterfall [
    (cb) -> $bcrypt.genSalt 10, cb
    (salt, cb) -> $bcrypt.hash password, salt, cb
  ], cb

#Compare user passwords
comparePassword = (password, userPassword, cb) -> $bcrypt.compare password, userPassword, cb