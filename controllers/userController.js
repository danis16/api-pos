'use strict';

const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let dbo;

module.exports = exports = function (srv) {
    //login authentication

    srv.post('/api/auth', (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
            if (err) {
                return next(new Error(err));
            }
            let entity = req.body;
            if (entity.userName == undefined || entity.password == undefined) {
                var error = new Error('user dan pass required');
                error.status = 500;
                return next(error);
            }

            dbo = dbase.db(config.dbname);

            let passCrypto = crypto.createHash('md5').update(entity.password).digest('hex');
            console.log(passCrypto);

            await dbo.collection('user')
                .findOne({ 'userName': entity.userName, 'password': passCrypto }, function (errFind, resFind) {
                        if (errFind) {
                            return next(new Error(errFind));
                        }

                        if (resFind) {
                            let token = jwt.sign({
                                userName: resFind.userName,
                                role : resFind.role
                            }, config.jwt_secret,
                                { expiresIn: config.expiresIn });

                            delete resFind.password;
                            resFind.token = token;

                            res.send(200, resFind);
                        } else {
                            res.send(403, {
                                ok: 0,
                                message: 'Username or password invalid !'

                            });
                        }

                    });

        });
    });
}