# socket.io-auth-ts
This package provides a simple authentication middleware for [socket.io](https://socket.io/).

## Installation
```
npm install socket.io-auth-ts
```

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

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
* This is a fork of hschulz's `socketio-auth-typescript` package. Motivation being that the documentation on his repository was out of date and using the callback as he described did not work correctly.
* User facundoolano also did this in CommonJS some time ago: https://github.com/facundoolano/socketio-auth
