var TCP = process.binding('tcp_wrap').TCP
var net = require('net')
var Handle = require('./handle')

function noop () {}

module.exports = function (onConnect) {
  var server = new TCP()

  return {
    listen: function (port, addr, cb) {
      cb = cb || noop
      var err
      if (net.isIPv6(addr)) {
        err = server.bind6(addr, port)
      } else {
        err = server.bind(addr, port)
      }

      if (err) {
        server.close()
        cb(err)
        return
      }

      // 512 connections allowed in backlog
      server.listen(511)

      server.onconnection = function (err, client) {
        if (err) {
          return console.error(new Error('error connected:' + err))
        }
        onConnect(Handle(client, noop))
      }
      return server
    },
    address: function () {
      if (server && server.getsockname) {
        var out = {}
        server.getsockname(out)
        return out
      } else if (this._pipeName) {
        return this._pipeName
      } else {
        return null
      }
    },
    close: function (cb) {
      server.close(cb)
      return server
    }
  }
}
