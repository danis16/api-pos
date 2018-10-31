'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const TimeStamp = require('../base/timeStamp');

let dbo;
module.exports = exports = function (srv) {
    let colName = 'variant';

    srv.post('/api/variant', (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let entity = req.body;

            if (entity.categoryId == undefined || entity.initial == undefined || entity.name == undefined || entity.active == undefined) {
                return res.send(500, {
                    error: true,
                    message: 'categoryId initial name and active are invalid'
                });
            }

            let variant = {};
            variant.categoryId = ObjectId(entity.categoryId);
            variant.initial = entity.initial;
            variant.name = entity.name;
            variant.active = entity.active;

            MatchCategory(dbo, entity.categoryId, (callback) => {
                if (callback.error != undefined) {
                    var error = new Error('Cattegory not found !');
                    error.status = 500;
                    return next(error)
                }
            });

            TimeStamp(variant, req);

            await dbo.collection(colName)
                .insertOne(variant, function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(201, {
                        variant: variant,
                        response: response
                    });
                    db.close();
                });
        });

    });

    srv.get('/api/variants', (req, res, next) => {
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

    srv.get('/api/variant/:id', verifyToken, (req, res, next) => {
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

    srv.put('/api/variant/:id', (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            let entity = req.body;

            if (entity.categoryId == undefined && entity.initial == undefined && entity.name == undefined && entity.active == undefined) {
                return res.send(500, {
                    error: true,
                    message: 'categoryId, initial, name or active is invalid'
                });
            }

            let variant = {};

            if (entity.categoryId != undefined) {
                variant.categoryId == ObjectId(entity.categoryId);
            }

            if (entity.initial != undefined) {
                variant.initial == entity.initial;
            }

            if (entity.name != undefined) {
                variant.name == entity.name;
            }

            if (entity.active != undefined) {
                variant.active == entity.active;
            }

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

    srv.del('/api/variant/:id', verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            let variant = req.body;
            dbo = db.db(config.dbname);

            dbo.collection(colName)
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


async function MatchCategory(dbo, id, callback) {

    // try {    
            dbo = db.db(config.dbname);
            await dbo.collection('category')
                .findOne({ "_id": ObjectId(id) }, function (error, doc) {
                    if (error) {
                        return callback(null);
                    }
    
                   return callback(doc); 
    
                });
        
    // } catch (error) {
        var err = new Error(error.message);
        err.status = 500;
        return callback(500);
    }
// }