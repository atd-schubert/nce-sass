"use strict";

var fs = require("fs");
var sass = require("node-sass"); // TODO: is it right?
var md5 = require("MD5");
var path = require("path");
var _ = require("underscore");

// TODO: maybe use nce-cache

module.exports = function(nce){
  if(!nce) throw new Error("You have to specify the nce object");
  
//# Mandantory Setup:
  var ext = nce.createExtension({package: require("./package.json")});
  
  ext.on("install", function(event){ // set options, but don't run or make available in nce
    //# Seting extension-config:
    ext.config.route = ext.config.route || "/"+ext.name;
    ext.config.dumpPath = ext.config.dumpPath || process.cwd() + "/sass";
    ext.config.cachePath = ext.config.cachePath || process.cwd() + "/css-cache";
    
    ext.config.renderOptions = ext.config.renderOptions || {};
    ext.config.renderOptions.includePaths = ext.config.renderOptions.includePaths || [ext.config.dumpPath];
    ext.config.renderOptions.imagePath = ext.config.renderOptions.imagePath || "";
    ext.config.renderOptions.outputStyle = ext.config.renderOptions.outputStyle || "compressed";
    
    
    //* nce-winston
    ext.config.logger = ext.config.logger || {};

    //# Declarations and settings:
    //* nce-winston
    ext.logger = nce.getExtension("winston").createLogger(ext.name, ext.config.logger);
    
  });
  
  ext.on("uninstall", function(event){ // undo installation
    //# Undeclare:
    //* nce-winston
    nce.getExtension("winston").removeLogger(ext.name);
    delete ext.logger;
  });
  
  ext.on("activate", function(event){ // don't set options, just run, make available in nce or register.
	  if(nce.requestMiddlewares.indexOf(router) === -1) {
		  nce.requestMiddlewares.push(router);
	  }
  });
  
  ext.on("deactivate", function(event){ // undo activation
	  if(nce.requestMiddlewares.indexOf(router) !== -1) {
		  nce.requestMiddlewares.splice(nce.requestMiddlewares.indexOf(router), 1);
	  }
  });
  
//# Private declarations:
  var cdn = {};
  var router = function sass(req, res, next){
    if(req.url.substr(0, ext.config.route.length) === ext.config.route) {
      if(/^\/requirejs.js/.test(req.url.substr(ext.config.route.length))) {
        var stream = fs.createReadStream(__dirname + "/assets/requirejs.js");
        var etag = md5(ext.name + "-" + ext.package.version);
        if(req.headers.etag === etag) {
          res.writeHead(304, {
            "content-type":"text/javascript",
            "etag": etag
          });
          return res.end();
        }
        res.writeHead(200, {
          "content-type":"text/javascript",
          "etag": etag
        });
        stream.on("error", function(err){
          next(err);
        });
        stream.on("data", function(data){
          res.write(data);
        });
        return stream.on("end", function(data){
          if(data) res.write(data);
          res.write([
            'require.config({',
              'baseUrl: "'+ext.config.route+'",',
              'paths: '+ JSON.stringify(cdn),
            '});'
        ].join(""));
          res.end();
        });
      };
      
      
      var sassPath = ext.config.dumpPath + req.url.substr(ext.config.route.length);
      if(path.relative(ext.config.dumpPath, sassPath).substr(0,2)=== "..") {// TODO #4: security! Don't make able to go in dirs upper then lib-root!
        res.writeHead(403, {
          "content-type":"text/plain"
        });
        var msg = "It is forbidden to requested a file from above of the sass-root!";
        ext.logger.warn(msg, req);
        return res.end(msg);
      }
      return fs.stat(sassPath, function(err, stats){
        if(err && err.message.indexOf("ENOENT") === 0) return next();
        if(err) return next(err);
        var etag = md5(stats.ino + stats.mtime.getTime());
        
        if(req.headers.etag === etag) {
          res.writeHead(304, {
            "content-type":"text/javascript",
            "etag": etag,
            "content-length":stats.size
          });
          return res.end();
        }
        var stream = fs.createReadStream(sassPath);
        
        res.writeHead(200, {
          "content-type":"text/javascript",
          "etag": etag,
          "content-length":stats.size
        });
        return stream.pipe(res);
      });
    }

    return next();
  };

//# Public declarations and exports:
  ext.define = function(name, code, cb){
    
    ext.emit("define", {name:name, code: code});
    ext.emit("define:"+name, {name:name, code: code});
    
    return fs.writeFile(ext.config.dumpPath + "/" + name + ".sass", code, cb);
  };
  ext.getSass = function(name, cb){
    return fs.readFile(ext.config.dumpPath + "/" + name + ".sass", cb);
  };
  ext.getCss = function(name, cb){
    return fs.readFile(ext.config.cachePath + "/" + name + ".css", cb);
  };
  ext.getSassStream = function(name){
    return fs.createReadStream(ext.config.dumpPath + "/" + name + ".sass");
  };
  ext.getCssStream = function(name){
    return fs.createReadStream(ext.config.cachePath + "/" + name + ".css");
  };
  ext.undefine = function(name, cb){
    fs.unlink(ext.config.dumpPath + "/" + name + ".sass", function(err){
      if(err && err.message.indexOf("ENOENT") === 0) return cb();
      if(err) return cb(err);
      ext.emit("undefine", {name:name});
      ext.emit("undefine:"+name, {name:name});
      return cb();
    })
  };
  ext.render = function(name, cb, opts){
    opts = opts || {};
    var hash;
    for (hash in ext.config.renderOptions) if(!(hash in opts)) opts[hash] = ext.config.renderOptions[hash];
    
    opts.file = ext.config.dumpPath + "/" + name + ".sass";
    opts.error = cb;
    opts.outFile = ext.config.cachePath + "/" + name + ".css";
    opts.success = function(result){
      ext.logger.info("Rendered sass", opts.file);
      fs.writeFile(ext.config.cachePath + "/" + name + ".css", result.css, function(err){
        if(err) return cb(err);
        return cb(null, result);
      });
    };
        
    sass.render(opts);
  };
  
  return ext;
}