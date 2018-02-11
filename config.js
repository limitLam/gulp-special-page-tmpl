var proCdn = {
    site : '//img1.cache.netease.com',
    route : '/bobo/img18/specical-tmpl'
}

module.exports = {
    //  端口号
    port: 8090,
    //  mock项目id
    mockProjectId : 21,
    //  proCdn
    proCdn: proCdn,
    //  cdnPath
    cdnPath: {
        dev: '../src/images',
        pro: proCdn.site + proCdn.route
    }
};