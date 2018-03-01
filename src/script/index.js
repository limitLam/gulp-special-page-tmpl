/**
 * 入口模块
 */
var isLogined = require('./isLogined');

console.log(isLogined);

jQuery(function(){
    //  js图片url测试
    var _header3 = jQuery(".test-head-3");
    _header3.append('<img src="@CDNPATH/header.jpg" alt="">');
    //  ejs测试
    var _body = jQuery("body");
    var tmpl1 = jQuery("#ejs-test").html();
    var tmpl2 = jQuery("#ejs-test2").html();
    _body.append(_.template(tmpl1)({
        name : '小肥肥'
    }));
    _body.append(_.template(tmpl2)({
        age : 18
    }));
});