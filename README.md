# pull-net

pull-stream directly to node's libuv bindings.

echo server works, don't handle all the edge cases yet,
or nice error messages etc.

## example

``` js
var createServer = require('pull-net/server')

createServer(function (stream) {
  pull(stream.source, stream.sink) //ECHO
}).listen(9999, '127.0.0.1')

var connect = require('pull-net/client')

var stream = connect(9999, '127.0.0.1')

pull(
  pull.once(new Buffer('hello tcp')),
  stream,
  pull.collect(console.log)
)
```

## Questions

node does some things that turn out to be unnecessary,
like, take a callback for `server.listen`.

Maybe these cause problem when trying to use other stream types though,
(such as like unix pipes, which are also handled in
[node/lib/net.js](https://github.com/nodejs/node/blob/master/lib/net.js))

This is probably mainly to handle some errors... maybe those errors
could just throw?

Also, there are often client type connections which may error
before receiving data (at least in their context, such as authentication errors)
often, this can't be a sync error. So that would suggest an api
that was `connect(function (err, stream) {...})`

what if a server was a stream of clients? does that really help?

## License

MIT
