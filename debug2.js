const http = require('http');
const origCreateServer = http.createServer;
http.createServer = function(...args) {
  const server = origCreateServer.apply(this, args);
  const origClose = server.close;
  server.close = function(...cargs) {
    console.log('SERVER CLOSE CALLED');
    console.log(new Error().stack);
    return origClose.apply(this, cargs);
  };
  
  const origUnref = server.unref;
  server.unref = function(...cargs) {
    console.log('SERVER UNREF CALLED');
    console.log(new Error().stack);
    if(origUnref) return origUnref.apply(this, cargs);
  };
  
  return server;
};
require('./server.js');
