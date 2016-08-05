const ShutdownWrap = process.binding('stream_wrap').ShutdownWrap
const WriteWrap = process.binding('stream_wrap').WriteWrap
const LOW = 32 * 1024
const HIGH = 64 * 1024

function noop () {}

module.exports = function (handle, cb) {
  var queue = []
  var buffered = 0
  var waiting = null
  var ended = null

  handle.onread = function (n, data) {
    if (n <= 0) ended = true

    if (waiting) {
      var cb = waiting
      waiting = null
      return cb(ended, data)
    }

    if (data) {
      queue.push(data)
      buffered += data.length
      if (buffered > HIGH) handle.readStop()
    }
  }

  function shutdown (cb) {
    var end = new ShutdownWrap()
    end.async = false
    end.handle = handle
    end.oncomplete = function (_, __, ___, err) {
      cb(err)
    }
    handle.shutdown(end)
  }

  return {
    source: function (abort, _cb) {
      if (abort) {
        shutdown(function (err) {
          _cb(err || abort)
          cb(err)
        })
      }

      if (queue.length) {
        var data = queue.shift()
        buffered -= data.length
        _cb(null, data)
      } else if (ended) {
        _cb(ended)
      } else {
        waiting = _cb
      }

      if (!ended && buffered < LOW) handle.readStart()
    },
    sink: function (read) {
      read(null, function next (err, data) {
        if (err) shutdown(cb)
        else {
          var write = new WriteWrap()
          write.async = false // what does this mean?
          write.handle = handle
          // this keeps the buffer being GC'd till write is complete (i think)
          write.buffer = data
          write.oncomplete = function (status, handle, req, err) {
            if (err) return read(err, cb)
            else read(null, next)
          }
          if (handle.writeBuffer(write, data) === 0) {
            write.oncomplete = noop
            read(null, next)
          }
        }
      })
    }
  }
}
