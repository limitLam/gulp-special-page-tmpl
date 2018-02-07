var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();

var port = 8091;

module.exports = function () {
    app.use("/", express.static(__dirname));
    app.use("/api", proxy({
        target: 'http://mock.bobo.netease.com',
        pathRewrite: {
            '^/api': '/mockjsdata/21/'
        },
        changeOrigin: true
    }));

    app.listen(port, () => {
        console.log(`server started at localhost:${port}`)
    });
}