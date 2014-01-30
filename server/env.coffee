env = {}

#Get environment var
exports.get = (key, def = null)-> env[key] ? def

#Set environment var
exports.set = (key, value)-> env[key] = value