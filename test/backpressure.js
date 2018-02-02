var crypto = require('crypto')
var net = require('..')
var pull = require('pull-stream')
var Looper = require('pull-looper')
var port = 9988, c = 0

net.createServer(function (stream) {
  pull(stream, stream)
//  pull(stream.source, pull.drain(console.log))
}).listen(port)

  net.connect(port, 'localhost', function (err, stream) {
    if(err) throw err

    pull(
      pull.infinite(function () {
        var d = crypto.randomBytes(1024*1)
        c += d.length
//        console.log(c)
        return d
      }),
      Looper,
      stream.sink
    )

//    stream.source(null, function (err, data) {
//      if(err) console.log('ended', err)
//      else console.log('data', data)
//    })
  

  var t = 0

    pull(stream.source, pull.asyncMap(function (d, cb) {
      setTimeout(function () {
        cb(null, d)
      }, 100)
    }), pull.drain(function (e) {
      console.log(e.length, t += e.length)
    }))
  })

