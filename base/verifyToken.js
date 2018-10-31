"use strict";

const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  try {
    if (config.allowAuth) {
      var token =
        req.headers["x-access-token"] || req.body.token || req.query.token;
      if (token) {
        jwt.verify(token, config.jwt_secret, function(error, decode) {
          if (error) {
            return next(new Error(error));
          }

          req.decode = decode;
          // console.log(decode);
          req.userName = decode.userName;
          req.role = decode.role;
          next();
        });
      } else {
        var error = new Error("Token not found");
        error.status = 403;
        return next(error);
      }
    } else {
      next();
    }
  } catch (error) {
    return next(new Error(error));
  }
};
