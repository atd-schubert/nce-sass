"use strict";

var fs = require("fs");
var NCE = require("nce");
var ExtMgr = require("nce-extension-manager");
var Ext = require("../");

describe('Basic integration in NCE', function(){
  var nce = new NCE();
  it('should be insertable into NCE', function(done){
    var ext = Ext(nce);
    if(ext) return done();
    return done(new Error("Is not able to insert extension into NCE"));
  });
});
describe('Basic functions in NCE', function(){
  var nce = new NCE();
  var ext = Ext(nce);
  var extMgr = ExtMgr(nce);
  extMgr.activateExtension(extMgr);
  
  it('should be installable', function(done){
    if(extMgr.installExtension(ext) && ext.status === "installed") return done();
    return done(new Error("Can not install extension"));
  });
  it('should be activatable', function(done){
    if(extMgr.activateExtension(ext) && ext.status === "activated") return done();
    return done(new Error("Can not activate extension"));
  });
  it('should be deactivatable', function(done){
    if(ext.deactivate()) return done();
    return done(new Error("Can not deactivate extension"));
  });
  it('should be uninstallable', function(done){
    if(ext.uninstall()) return done();
    return done(new Error("Can not uninstall extension"));
  });
  
  it('should be installable again', function(done){
    if(ext.install()) return done();
    return done(new Error("Can not install extension"));
  });
  it('should be activatable again', function(done){
    if(ext.activate()) return done();
    return done(new Error("Can not activate extension"));
  });
  it('should be deactivatable again', function(done){
    if(ext.deactivate()) return done();
    return done(new Error("Can not deactivate extension"));
  });
  it('should be uninstallable again', function(done){
    if(ext.uninstall()) return done();
    return done(new Error("Can not uninstall extension"));
  });
});
describe('Methods of the extension', function(){
  var nce = new NCE({sass:{dumpPath:__dirname + "/../dump4test", cachePath:__dirname + "/../cache4test"}});
  var ext = Ext(nce);
  var extMgr = ExtMgr(nce);
  extMgr.activateExtension(extMgr);
  extMgr.activateExtension(ext);
  
  var sassStr = fs.readFileSync(__dirname + "/../example4test.sass").toString();
  
  it('should define sass', function(done){
    ext.define("test", sassStr, done);
  });
  it('should get a defined sass', function(done){
    ext.getSass("test", function(err, code){
      if(code.toString() === sassStr) return done();
      return done(new Error("Wrong Code"));
    });
  });
  it('should render function', function(done){
    ext.render("test", function(err, result){
      done(err);
    });
  });
  it('should get rendered css', function(done){
    ext.getCss("test", function(err, data){
      if(err) return done(err);
      data = data.toString();
      if(data.indexOf("body")>=0 && data.indexOf("font")>=0 && data.indexOf("Helvetica")>=0 && data.indexOf("sans-serif")>=0 && data.indexOf("color")>=0) return done();
      done(new Error("Incorrect css code"));
    });
  });
});