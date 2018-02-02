var pull = require('pull-stream')

var net = require('net')
var toPull = require('stream-to-pull-stream')

var createServer = require('../server')

var server = createServer(function (stream) {
  console.log(stream)
  pull(
    stream.source,
    pull.through(function (data) {
      console.log('THROUGH', data)
    }, function (err) {
      console.log('END', err)
    }),
    stream.sink)
}).listen(9090, '::1')

var client = net.connect(9090, '::1')
pull(
  pull.values([new Buffer('HELLO THERE')]),
  toPull.duplex(client),
  pull.drain(console.log, function () {
    console.log('END')
    server.close()
  })
)
