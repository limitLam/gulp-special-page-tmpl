var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();

var config = require('./config');

var port = config.port;

var mockProjectId = config.mockProjectId;

module.exports = function () {
    app.use("/", express.static(__dirname));
    app.use("/api", proxy({
        target: 'http://mock.bobo.netease.com',
        pathRewrite: {
            '^/api': `/mockjsdata/${mockProjectId}/`
        },
        changeOrigin: true
    }));

    app.listen(port, () => {
        console.log(`Page at http://localhost:${port}/dist/index.html`)
    });
}