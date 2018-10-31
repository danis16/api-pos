'use strict';

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const TimeStamp = require('../base/timeStamp');

let dbo;
module.exports = exports = function (srv) {

    let colName = 'product';

    srv.post('/api/product',verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let entity = req.body;

            if (entity.variantId == undefined || entity.initial == undefined || entity.name == undefined || entity.active == undefined || entity.description == undefined || entity.price == undefined) {
                return res.send(500, {
                    error: true,
                    message: 'variantId initial name and active are invalid'
                });
            }

            let product = {};
            product.variantId = ObjectId(entity.variantId);
            product.initial = entity.initial;
            product.name = entity.name;
            product.active = entity.active;
            product.price = entity.price;
            product.description = entity.description;

            TimeStamp(product, req);

            await dbo.collection(colName)
                .insertOne(product, function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(201, {
                        product: product,
                        response: response
                    });
                });
        });

    });

    srv.get('/api/products',(req, res, next) => {
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

    srv.get('/api/product/:id', verifyToken,(req, res, next) => {
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

    srv.put('/api/product/:id',verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            let entity = req.body;

            if (entity.variantId == undefined && entity.initial == undefined && entity.name == undefined && entity.active == undefined && entity.description == undefined && entity.price == undefined) {
                return res.send(500, {
                    error: true,
                    message: 'variantId, initial, name or active is invalid'
                });
            }

            let product = {};

            if (entity.variantId != undefined) {
                product.variantId == ObjectId(entity.variantId);
            }

            if (entity.initial != undefined) {
                product.initial == entity.initial;
            }

            if (entity.name != undefined) {
                product.name == entity.name;
            }

            if (entity.active != undefined) {
                product.active == entity.active;
            }

            if (entity.description != undefined) {
                product.description == entity.description;
            }

            if (entity.price != undefined) {
                product.price == entity.price;
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

    srv.del('/api/product/:id', verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            let product = req.body;
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