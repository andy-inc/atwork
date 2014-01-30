IP = process.env["IP"] || "127.0.0.1"
PORT = process.env["PORT"] || 3001

module.exports = exports =
  db:
    url: process.env["DB_URL"] || "mongodb://localhost/atwork"
    users: [
      {email: process.env["ADMIN_EMAIL"] || "admin@atwork.ru", password: process.env["ADMIN_PASSWORD"] || "admin-password", allow: ['admin']}
      {email: process.env["TERMINAL_EMAIL"] || "terminal@atwork.ru", password: process.env["TERMINAL_PASSWORD"] || "terminal-password", allow: ['terminal']}
    ]
  server:
    host: IP
    port: PORT
    cookie:
      path: '/'
      httpOnly: true
      maxAge: 60*60*24*7
    secret: process.env["COOKIE_SECRET"] || "cookie secret string"
