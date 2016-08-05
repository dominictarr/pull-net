var pull = require('pull-stream')

var net = require('net')
var toPull = require('stream-to-pull-stream')

var createServer = require('../server')

var server = createServer(1234, 'localhost', function (stream) {
  console.log(stream)
  pull(
    stream.source,
    pull.through(function (data) {
      console.log('THROUGH', data)
    },function (err) {
      console.log('END', err)
    }),
    stream.sink)
})

var client = net.connect(1234, 'localhost')
pull(
  pull.values([new Buffer('HELLO THERE')]),
  toPull.duplex(client),
  pull.drain(console.log, function () {
    console.log('END')
    server.close()
  })
)
