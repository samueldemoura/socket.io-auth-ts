import { Server, Socket } from "socket.io"

/** Callback used after the authentication */
export type AuthResponseCallback = (error?: Error) => void

/** Method signature used by the authentication process. */
export type AuthenticationCallback = (socket: AuthenticatedSocket, data: any, callback: AuthResponseCallback) => void

/** Method signature used by the post authentication process. */
export type PostAuthenticationCallback = (socket: AuthenticatedSocket, data: any) => void

/** Method signature used by the disconnect process. */
export type DisconnectCallback = (socket: AuthenticatedSocket) => void

/**
 * Extend the SocketIO.Socket interface.
 */
export interface AuthenticatedSocket extends Socket {

    /**
     * Additional field to signal if the authentication was successful
     */
    isAuthenticated: boolean
}

/**
 * Parameters used for the authentication procedure.
 */
export interface AuthenticationConfig {

    /**
     * Called to handle the authentication procedure.
     */
    onAuthenticate: AuthenticationCallback,

    /**
     * Called after the client is authenticated.
     */
    onPostAuthenticate?:  PostAuthenticationCallback | void,

    /**
     * Called after the client is disconnected.
     */
    onDisconnect?: DisconnectCallback | void,

    /**
     * Number of millisenconds to wait for a client to authenticate.
     */
    timeout?: number
}

/**
 * Adds connection listeners to the given socket.io server, so clients
 * are forced to authenticate before they can receive events.
 * 
 * @param server The Socket.IO server that needs authentication
 * @param config The authentication configuration
 */
export function authenticateSocket(server: Server, config: AuthenticationConfig): void {

    /** Apply a default of 1 second for the timeout when unset */
    const timeout: number = config.timeout || 1000

    /* Disable connections for all namespaces */
    Object.entries(server.nsps).forEach(suspendItem => {
        suspendConnection(suspendItem[1])
    })

    /* Handle connection */
    server.on('connection', (socket: AuthenticatedSocket) => {

        /* Set socket to unauthenticated */
        socket.isAuthenticated = false

        /* Handle authentication for connection */
        socket.on('authentication', data => {

            /* Pass data to callback function */
            config.onAuthenticate(socket, data, (error?) => {

                /* If the callback yields a successfull authentication */
                if (socket.isAuthenticated) {

                    /* Restore previously disabled unauthenticated connections */
                    Object.entries(server.nsps).forEach(restoreItem => {
                        restoreConnection(restoreItem[1], socket)
                    })

                    /* Signal successful authentication */
                    socket.emit('authenticated')

                    /* In case a post authentication callback is given */
                    if (config.onPostAuthenticate) {
                        config.onPostAuthenticate(socket, data)
                    }

                /* The callback yields an error during authentication */
                } else if (error) {

                    /* Signal failed authentication */
                    socket.emit('unauthorized', { message: error.message })
                    socket.disconnect()

                /* The callback yields an unsuccessfull authentication */
                } else {

                    /* Signal a failure during authentication */
                    socket.emit('unauthorized', { message: 'Authentication failure' })
                    socket.disconnect()
                }
            })
        })

        /* Handle disconnect events for connection */
        socket.on('disconnect', () => {

            /* If a disconnect handler is given */
            if (config.onDisconnect) {
                config.onDisconnect(socket)
            }
        })

        /* If a timeout was set */
        if (timeout > 0) {
            setTimeout(() => {

                /* If the socket didn't authenticate within the timeout */
                if (!socket.isAuthenticated) {

                    /* Force disconnect */
                    socket.disconnect()
                }
            }, timeout)
        }
    })
}

/**
 * Add a connection handler to the socket so unauthenticated
 * sockets will be removed from the connection list.
 * The suspended connections will be restored later when
 * they have been authenticated.
 * 
 * @param namespace The Socket.IO namespace that will be disconnected
 * @returns void
 */
function suspendConnection(namespace: SocketIO.Namespace): void {

    /* If a connection is made */
    namespace.on('connect', (socket: AuthenticatedSocket) => {

        /* And the socket is not authenticated yet */
        if (!socket.isAuthenticated) {

            /* Remove the socket from the connected socket list */
            delete namespace.connected[socket.id]
        }
    })
}

/**
 * Restore previously suspended socket connections to a namespace.
 * 
 * @param namespace The namespace that will be reconnected
 * @param socket The socket the namespace will be connected to
 * @returns void
 */
function restoreConnection(namespace: SocketIO.Namespace, socket: AuthenticatedSocket): void {

    /* The socket is known */
    if (socket.id in namespace.sockets) {

        /* Re-Add the socket to the connected socket list */
        namespace.connected[socket.id] = socket
    }
}
