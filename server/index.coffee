#Init require method
_require = require 'a.require'
_require.init
  root: __dirname

#Load bootstrap
_bootstrap = _require './bootstrap'

_bootstrap.start (err)->
  throw err if err