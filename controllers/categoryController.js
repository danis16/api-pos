'use strict'

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const TimeStamp = require('../base/timeStamp');

let dbo; // sebagai db object
module.exports = exports = function (srv) {
    //Post/Insert/Add
    let colName = 'category';

    srv.post('/api/category', verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, {
            useNewUrlParser: true
        }, async function (err, dbase) {
            if (err) {
                return next(new Error(err));
            }

            dbo = dbase.db(config.dbname);
            let entity = req.body;

            if (entity.initial == undefined || entity.name == undefined || entity.active == undefined) {
                var error = new Error('initial, name and active are invalid!');
                error.status = 500;
                return next(error);
                // return next(new Error({
                //     status: 500,
                //     message: 'initial , name and active are invalid!'
                // }));
            }

            let category = {};

            category.initial = entity.initial;
            category.name = entity.name;
            category.active = entity.active;

            TimeStamp(category, req);

            await dbo.collection(colName)
                .insertOne(category, function (Error, response) {
                    if (Error) {
                        return next(new Error(Error));
                    }
                    res.send(201, {
                        category: category,
                        response: response
                    });
                    dbase.close();
                });
        });

    });
  

    srv.get('/api/categories',verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection(colName)
                .find().toArray(function (error, docs) {
                    if (error) {
                        return next(new Error(error));
                    }
                    res.send(200, docs);
                    db.close();
                });
        });
    });

    srv.get('/api/category/:id', (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            dbo = db.db(config.dbname);

            await dbo.collection(colName)
                .findOne({ "_id": ObjectId(id) }, function (error, doc) {
                    if (error) {
                        return next(new Error(error));
                    }
                    res.send(200, doc);
                    db.close();

                });

        });
    });

    //EDIT

    srv.put('/api/category/:id', (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            let entity = req.body;

            if (entity.initial == undefined && entity.name == undefined && entity.active == undefined) {
                // return next(new Error({
                var error = new Error('initial or name or active invalid !');
                error.status = 500;
                return next(error);
                // }));

            }

            let category = {};

            if (entity.initial != undefined) {
                category.initial == entity.initial;
            }

            if (entity.name != undefined) {
                category.name == entity.name;
            }

            if (entity.active != undefined) {
                category.active == entity.active;
            }

            TimeStamp(category, req);

            dbo = db.db(config.dbname);

            await dbo.collection(colName)
                .findOneAndUpdate({ "_id": ObjectId(id) }, { $set: entity }, function (error, doc) {
                    if (error) {
                        return next(new Error(error));
                    }
                    res.send(200, doc);
                    db.close();

                });

        });

    });

    //DELETE

    srv.del('/api/category/:id', (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            let category = req.body;
            dbo = db.db(config.dbname);

            await dbo.collection(colName)
                .findOneAndDelete({ "_id": ObjectId(id) }, function (error, doc) {
                    if (error) {
                        return next(new Error(error));
                    }
                    res.send(200, doc);
                    db.close();

                });

        });

    })


}