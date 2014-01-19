/**
 * Created by andy <andy.sumskoy@gmail.com> on 07/12/13.
 */

var $errors = require('omnis.core').errors;

module.exports = exports = {
    S1000: "Http server Error",
    A1000: "Please login first",
    A1001: "User not found $0",
    A1002: "Access denied",
    U1001: "User already exists $0",
    U1002: "Can not delete system user $0",
    U1003: "User not found $0",
    M1000: "Can not connect to mongodb",
    R1000: "Validation error",
    K1001: "Key already exists",
    K1002: "Key not found $0"
};

$errors.compile(exports);