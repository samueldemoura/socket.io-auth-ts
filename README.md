# socket.io-auth-ts
This package provides a simple authentication middleware for [socket.io](https://socket.io/).

## Deprecation Notice
This was made before the release of socket.io v3. If you are using version 3 or later, I strongly urge you to consider using the new [middleware and auth support](https://socket.io/docs/v3/middlewares/#Sending-credentials) instead, as this repository is not maintained anymore.

## Installation
```
npm install socket.io-auth-ts
```

## Security Warning
As of version 2.0.0, **all messages are sent to unauthenticated sockets without restriction!** The server **MUST** check the `isAuthenticated` field on the socket before emitting anything to determine whether the client is allowed to receive a particular piece of data.

This is due to a change that happened in socket.io's internal API when migrating to the latest 4.0.0 release.

## Usage
### In the server:
```typescript
import { authenticateSocket } from 'socket.io-auth-ts'

const server = createServer().listen(56789)
const sio: socketio.Server = socketio.listen(server)

const onAuthenticate = (
  socket: SocketIO.Socket, data: any, cb: (err?: Error) => void
) => {
  if (!data)
    return cb(new Error('No authentication data.'));

  if (data === 'isSomehowValid') {
    // Call the callback without an error to indicate
    // authentication success.
    return cb();
  } else {
    // Call with an error to indicate authentication
    // failure and send the error message to the client.
    return cb(new Error('Invalid authentication data.'))
  }
};

authenticateSocket(sio, {
  onAuthenticate
})
```

### In the client:
```javascript
var io = require('socket.io-client');

var socket = io.connect('http://localhost:56789');

socket.on('connect', () => {
  socket.emit('authenticate', 'isSomehowValid');

  socket.on('authenticated', () => {
    // The socket is now authenticated.
  });

  socket.on('unauthorized', (message) => {
    // There was an error during the authentication.
  });
});
```

## Changelog

### v2.0.0
- Add support for socket.io v4.0.0, drop support for older versions due to breaking changes.

### v1.0.0
- Initial release after forking from hschulz's original repository.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
* This is a fork of hschulz's `socketio-auth-typescript` package. Motivation being that the documentation on his repository was out of date and using the callback as he described did not work correctly.
* User facundoolano also did this in CommonJS some time ago: https://github.com/facundoolano/socketio-auth
