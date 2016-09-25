var pull = require('pull-stream')
var tape = require('tape')

var connect = require('../client')
//var createServer = require('../server')
var net = require('net')
var toPull = require('stream-to-pull-stream')

var server

tape('setup server', function (t) {
  server = net.createServer(function (stream) {
    stream = toPull.duplex(stream)
    pull(
      stream.source,
      pull.through(function (data) {
        console.log('THROUGH', data)
      }, function (err) {
        console.log('END', err)
      }),
      stream.sink)
  }).listen(9988, function () {
    t.end()
  })
})

console.log('server', server)

// setTimeout(function () {

function echoTest(args) {
  tape('connect to echo server with:'+JSON.stringify(args), function (t) {
    connect.apply(null, args.concat(function (err, stream) {
      //(9988, '127.0.0.1')
      if(err) throw err

      var input = [new Buffer('HELLO THERE')]

      pull(
        pull.values(input),
        stream,
        pull.collect(function (err, ary) {
          if(err) throw err
          t.deepEqual(ary, input)
          t.end()
        })
      )
    }))
  })
}


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

echoTest([9988, '127.0.0.1'])
echoTest([9988, 'localhost'])
//echoTest([9988, '127.0.0.1'])
echoTest([9988, '0.0.0.0'])
echoTest([9988, '::'])
echoTest([{port: 9988}])

tape('close server', function (t) {
  server.close()
  t.end()
})








