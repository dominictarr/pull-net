var Handle = require('./handle')
var TCP = process.binding('tcp_wrap').TCP
var TCPConnectWrap = process.binding('tcp_wrap').TCPConnectWrap
var pull = require('pull-stream')
var net = require('net')

module.exports = function (port, address, cb) {
  cb = cb || function () {}
  port |= 0
  var clientHandle = new TCP()
  var connect = new TCPConnectWrap()
  var stream

  connect.port = port
  connect.address = address
  connect.oncomplete = function afterConnect (err) {
    if (err) return cb(new Error('error connecting 1:' + err))
    cb && cb(null, stream)
  }
  var err
  if (net.isIPv4) {
    err = clientHandle.connect(connect, address, port)
  } else {
    err = clientHandle.connect6(connect, address, port)
  }

  if (err) {
    err = new Error('connection failed: ' + err)
    return {
      source: pull.error(err),
      sink: function (read) { read(err, cb) }
    }
  }
  return Handle(clientHandle, cb)
}

