var pull = require('pull-stream')

var connect = require('../client')
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
}).listen(9988, '127.0.0.1')

console.log('server', server)

// setTimeout(function () {

var client = connect(9988, '127.0.0.1')

//, function (err, stream) {
//    if(err) throw err
//    console.log(err, stream)
//    pull(
//      pull.values([new Buffer('HELLO THERE')]),
//      stream,
//      pull.drain(console.log, function () {
//        console.log('END')
//        server.close()
//      })
//    )
//  })
// },100)

pull(
  pull.values([new Buffer('HELLO THERE')]),
  client,
  pull.drain(console.log, function () {
    console.log('END')
    server.close()
  })
)
