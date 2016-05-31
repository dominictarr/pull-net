var TCP = process.binding('tcp_wrap').TCP;
var Handle = require('./handle')

function noop() {}

module.exports = function (onConnect) {
  var server = new TCP();

  return {
    listen: function (port, addr, cb) {
      var err = server.bind(addr, port)
      if(err) throw Error('could not bind') //server.close(), cb && cb(err)

      //512 connections allowed in backlog
      server.listen(511)

      server.onconnection = function(err, client) {
        if (err) return console.error(new Error('error connected:'+err))
        onConnect(Handle(client, noop))
      }
      return server
    },
    close: function () {
      server.close()
      return server
    }
  }
}












