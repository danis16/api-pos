const restify = require('restify');
const corsMiddle = require('restify-cors-middleware');

const server = restify.createServer({
    name: 'WEB API batch 175',
    version: '1.0.0'
});

// Global Configuration
global.config = require('./base/config');
global.verifyToken = require('./base/verifyToken');

server.get('/', restify.plugins.serveStatic({
    directory: __dirname,
    default: '/index.html' //jika API di panggil muncul ini
}));

//Body parser

server.use(restify.plugins.bodyParser());

//Query Parser
const cors=corsMiddle({
    origins:['*'],
    allowHeaders:['x-app-version','x-access-token'],
    exposeHeaders:[]
});

server.pre(cors.preflight);

server.use(cors.actual);

//Route Category
require('./controllers/orderController')(server);

//Route Category
require('./controllers/userController')(server);

//Route Category
require('./controllers/categoryController')(server);

//Route Variant
require('./controllers/variantController')(server);

//Route Variant
require('./controllers/productController')(server);

//Response error
server.use((error, req, res, next) => {
    console.log({
        message: error.message
    });
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

server.listen(config.port, function () {
    console.log('%s listen at %s', server.name, server.url);
    //menampilkan informasi API udah berjalan apa belum
});
