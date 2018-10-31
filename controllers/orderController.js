'use strict';

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const TimeStamp = require('../base/timeStamp');

let dbo;
module.exports = exports = function (srv) {
    //route poss


    srv.post('/api/order', verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
            if (err) {
                return next(err);
            }
            dbo = dbase.db(config.dbname);

            var entity = req.body;
            if (entity.payment == undefined) {
                var error = new Error('Payment is require');
                error.status = 500;
                return next(error);
            }



            GetNewReference(dbo, newRef => {
                var header = {};
                header.payment = entity.payment;
                header.reference = newRef;

                TimeStamp(header, req);

                dbo.collection('orderHeader').insertOne(header, (errHeader, resHeader) => {
                    if (errHeader) {
                        return next(new Error(errHeader));
                    }
                    if (resHeader) {
                        var details = entity.details;
                        details.forEach(order => {
                            if (order.productId == undefined || order.quantity == undefined || order.price == undefined) {
                                var error = new Error('ProductId and Quantity and Price are required !');
                                error.status = 500;
                                return next(error);
                            }

                            order.headerId = header._id;
                            order.productId = ObjectId(order.productId);
                            TimeStamp(order, req);

                        });

                        dbo.collection('orderDetail').insertMany(details, (errDetail, resDetail) => {
                            if (errDetail) {
                                return next(new Error(errDetail));
                            }
                            return res.send(201, {
                                header: header, //depan property, belakang diambil dari codingan
                                details: details
                            });
                        });
                    }
                });
                // res.send(201, {
                //     reff: newRef
                // });
            });
        });
    });

    srv.get('/api/orderrpt',  (get, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
            if (err) {
                return next(err);
            }
            dbo = dbase.db(config.dbname);

           await dbo.collection('orderHeader')
                .aggregate([
                    { $lookup: { from: 'orderDetail', localField: '_id', foreignField: 'headerId', as: 'details' } },
                    { $unwind: { path: '$details', 'preserveNullAndEmptyArrays': true } },
                    { $lookup: { from: 'product', localField: 'details.productId', foreignField: '_id', as: 'details.product' } },
                    { $unwind: { path: '$details.product', 'preserveNullAndEmptyArrays': true } },

                    {
                        $group: {
                            "_id": "$_id",
                            "payment": "$payment",
                            "createBy": { $first: "$createBy" },
                            "createDate": { $first: "$createDate" },
                            "reference": { $first: "$reference" },
                            "payment": { $first: "$payment" },
                            "details": { $push: "$details" }
                        }
                    },
                    {
                        $project: {
                            "details.createBy": 0,
                            "details.createDate": 0,
                            "details.modifyBy": 0,
                            "details.modifyDate": 0,
                            "details.active": 0,
                            "details.headerId": 0,
                            "details.productId": 0, 
                            "details.product.active": 0,
                            "details.product.createBy": 0,
                            "details.product.createDate": 0,
                            "details.product.modifyBy": 0,
                            "details.product.modifyDate": 0,
                        }
                    },{
                        $sort: {reference: -1}
                    }

                ]).toArray(function (err, response){
                if (err) {
                    return next(new Error(err));
                }
                res.send(200, response);
            });
        });

    });

}

function GetNewReference(dbo, callback) {
    var newRef = 'SLS-' + new Date().getFullYear().toString().substr(-2) + ("0" + (new Date().getMonth() + 1)).substr(-2) + "-";
    //  2018 -> -2 (ambil 2 digit dari belakang) , kalo 2 ambil 2 digit dari depan 
    var lastRef = '0001';

    dbo.collection('orderHeader').aggregate([
        {
            $match: { 'reference': { $regex: '.*' + newRef + '.*' } }
        },
        {
            $group: {
                _id: null,
                maxValue: { $max: '$reference' }
            }
        }
    ]).toArray(function (error, response) {
        if (error) {
            return next(error);
        }

        if (response && response.length > 0) {
            var arr = response[0].maxValue.split("-");
            var inc = parseInt(arr[2]) + 1;
            lastRef = newRef + ("0000" + inc).substr(-4);
            return callback(lastRef);
        } else {
            return callback(newRef + lastRef);
        }
    });

}