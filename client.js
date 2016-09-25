var Handle = require('./handle')
var TCP = process.binding('tcp_wrap').TCP
var TCPConnectWrap = process.binding('tcp_wrap').TCPConnectWrap
var pull = require('pull-stream')
var net = require('net')
var errno = require('util')._errnoException

var lookup = require('dns').lookup

module.exports = function (opts, host, cb) {
  var port
  if(!cb) cb = host, host = null
  if('number' == typeof opts)
    port = opts
  else if(opts && 'object' === typeof opts) {
    host = opts.host; port = opts.port
  }
  host = host || '0.0.0.0'

  var clientHandle = new TCP()

  function connect(host, port, cb) {
    var stream
    var wrap = new TCPConnectWrap()
    wrap.port = port
    wrap.address = host
    wrap.oncomplete = function afterConnect (err) {
      if (err) cb(errno(err, 'connect'))
      else cb(null, stream)
    }

    if(net.isIPv4(host))
      err = clientHandle.connect(wrap, host, port)
    else
      err = clientHandle.connect6(wrap, host, port)

    if(err) cb(errno(err))
    else stream = Handle(clientHandle)
  }

  var err

  if(net.isIP(host))
    connect(host, port, cb)
  else
    lookup(host, function (err, ip) {
      if(err) cb(errno(err, 'dns-lookup'))
      else connect(ip, port, cb)
    })

}


