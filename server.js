var TCP = process.binding('tcp_wrap').TCP
var net = require('net')
var Handle = require('./handle')
var errno = require('util')._errnoException

var lookup = require('dns').lookup

module.exports = function (onConnect) {
  var server = new TCP()
  var host, port
  return {
    listen: function (opts, cb) {
      if('object' == typeof opts) {
        host = opts.host || '0.0.0.0'
        port = opts.port | 0
      }
      else if('number' === typeof opts) {
        port = opts
        host = '0.0.0.0'
      }
      cb = cb || function (err) { if(err) throw err }
      var err

      function listen (host, port, cb) {
        if(net.isIPv4(host))
          err = server.bind(host, port)
        else
          err = server.bind6(host, port)

        if (err) {
          server.close()
          cb(errno(err))
          return
        }

        // 512 connections allowed in backlog
        server.listen(511)

        server.onconnection = function (err, client) {
          if (err) console.error(errno(err))
          else onConnect(Handle(client))
        }
      }

      if (net.isIP(host))
        listen(host, port, cb)
      else {
        lookup(host, function (err, ip) {
          if(err) cb(err)
          else listen(ip, port, cb)
        })
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

