'use strict';

module.exports = {
    port: process.env.PORT || 8100,
    dbconn: process.env.DB_CONN || 'mongodb://localhost:27017/posdb', //posdb adalah nama database
    dbname: process.env.DB_NAME || 'posdb',
    allowAuth: false,
    jwt_secret: 'xsis1234',
    expiresIn : 86400 //satuan detik dalam sehari

}