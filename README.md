# gulp-special-page-tmpl
BOBO-WEB专题页模板

## 测试页面地址
http://www.bobo.com/special/specical-tmpl/

## 目的
目前web专题页的开发仍然是一个页面html+css+js集合到一起的，本模板是为了开发的时候可以让html,css和js拆分来开发，同时最后放到cms上又能保留源码，直接拉下来修改也可以

## 目录
```javascript
||---dist   //  build目录，pro生成html文件内容可以直接放到cms上  
||---node_modules   //  npm包文件夹  
||---src    //  源码目录  
||---||---ejs       //  ejs文件目录
||---||---handlebar //  handlebar目录
||---||---html      //  html文件目录  
||---||---images    //  图片目录
||---||---||---icon    //  雪碧图目录  
||---||---script    //  脚本目录  
||---||---style      //  样式文件目录，用sass  
||---||---tmpl //  html模板文件  
||---temp   //  临时文件目录，可以不管  
||---.gitignore //  git仓库用于配置忽略文件的  
||---config.js  //  项目相关配置js  
||---gulpfile.js    //  gulp配置文件  
||---package.json   //  项目配置文件  
||---README.MD  //  MD文件  
||---server.js  //  用于启动本地开发环境的js
```

## cli指令
```javascript
npm run dev 启动开发环境
npm run pro 生成production环境html，并上传图片到cdn
```  

## 使用方法

###整体配置（重要！必须先配置好）——根目录下config.js文件

```javascript
var proCdn = {
    //  cdn站点
    site : '//img1.cache.netease.com',
    //  cdn路由
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
        //  开发环境cdn
        dev: '../src/images',
        //  生产环境cdn
        pro: proCdn.site + proCdn.route
    }
};
```

## 关于图片cdn
现在可以直接在css,html或js中写@CDNPATH/{本地images文件夹下的路径}，就可以引用图片了，本地会引用本地的图片，pro会转化会cdn的图片

## 关于雪碧图
```css
//  三种用法
//  注：以下文件名均不包括后缀

//  1.include sprite-{icon目录下的图片名}
.sprite-1{
    @include sprite-reward-1;
}

//  2.extend .icon-{icon目录下的图片名}
.sprite-2{
    @extend .icon-reward-2;
}

//  3.直接使用类名.icon-{icon目录下的图片名}
<em class="icon-reward-3"></em>
```

## 关于ejs
```javascript
//  引入ejs模板，通过id为ejs-{ejs目录下的文件名,没有后缀}的js模板引入
var tmpl = jQuery("#ejs-test").html();

//  使用ejs，html为渲染出来的字符串，data为参数对象
//  html中已经引入_.template，可以直接全局使用
var html = _.template(tmpl)(data);
```