/**
 * 是否登录模块
 */
var isLogined = (function () {
    //  兼容本地环境
    try {
        //  专题页获取是否登录的方式
        return userJson.userCard.userIdStr != "null";
    } catch (e) {
        return false;
    }
})();

module.exports = isLogined;