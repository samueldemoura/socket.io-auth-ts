# socketio-auth-typescript

This package provides authentication for [Socket.IO](https://socket.io/)

## Installing

The install ist pretty forward. Just install the npm package and you're finished.

```
npm -i @hschulz/socketio-auth-typescript
```

## Usage

### Server
```typescript
import { authenticateSocket } from "@hschulz/socketio-auth-typescript"

const server = createServer().listen(56789)
const sio: socketio.Server = socketio.listen(server)

const onAuthenticate = (socket: SocketIO.Socket, data: any, callback: (err?: Error, success?: boolean) => void) => {

    /* Data will be whatever the client sent */
    if (!data) {
        return callback(new Error('Authentication error - No Data'))
    }

    /* However you validate the client data */
    if (data === 'isSomehowValid') {
        return callback(void, true)
    }

    /* No authentication */
    return callback(void, false)
};

authenticateSocket(sio, {
    onAuthenticate
})
```

### Client

```javascript
var io = require('socket.io-client');

var socket = io.connect('http://localhost:56789');

socket.on("connect", () => {

    socket.emit("authentication", "isSomehowValid");

    socket.on("authenticated", () => {
        // The socket is now authenticated
    });

    socket.on("unauthorized", (message) => {
        // There was an error during the authentication
    });
});
```

## Built With

* [TypeScript](https://www.typescriptlang.org/)
* [Socket.IO](https://socket.io/)
* [Definitly Typed](https://github.com/DefinitelyTyped/DefinitelyTyped)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/hschulz/socketio-auth-typescript/tags). 

## Authors

* **Hauke Schulz** - *Developer* - [hschulz](https://github.com/hschulz)

See also the list of [contributors](https://github.com/hschulz/socketio-auth-typescript/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

https://github.com/facundoolano/socketio-auth also did this in CommonJS some time ago
