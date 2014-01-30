module.exports = exports = {
    "server": {
        "ip": "127.0.0.1",
        "port": 5000,
        "cookie": {
            "secret": "very_secret_code"
        },
        "session": {
            "url": "mongodb://localhost/atwork/sessions",
            "auto_reconnect": true
        }
    },
    "db": {
        "url": "mongodb://localhost/atwork"
    },
    "defaultUsers": [
        { "email": "test-root-default@test.com", "password": "testpassword", "allow": ["root"]}
    ]
};