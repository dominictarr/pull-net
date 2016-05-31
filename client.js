var Handle = require('./handle')
var TCP = process.binding('tcp_wrap').TCP;
var TCPConnectWrap = process.binding('tcp_wrap').TCPConnectWrap;

module.exports = function (port, address, cb) {
  var clientHandle = new TCP()
  var connect = new TCPConnectWrap(), stream

  connect.oncomplete = function (err) {
    if(err) return cb(new Error('error connecting 1:'+err))
    cb && cb(null, stream)
  }
  var err = clientHandle.connect(connect, address, port);

  stream = err ? Handle(clientHandle, function () {}) : error.duplex(err)
  if(!err) return Handle(clientHandle, function () {})
  if(err) return cb(new Error('error connecting 2:'+err))

//so, I could actually return the client stream syncly.


//
//  if(err) {
//    console.log("ERROR", err)
//    err = new Error('connection failed:'+err)
//    return {
//      source: Error(err),
//      sink: function (read) {read(err, cb)}
//    }
//  }
//  return Handle(clientHandle, cb)
}

