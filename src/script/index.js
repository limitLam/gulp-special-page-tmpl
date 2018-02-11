/**
 * 入口模块
 */
var isLogined = require('./isLogined');

console.log(isLogined);

jQuery(function(){
    var _header3 = jQuery(".test-head-3");
    _header3.append('<img src="@CDNPATH/header.jpg" alt="">');
});