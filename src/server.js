/**
 * Import vendor packages
 */
const net = require('net');
const { v4: uuidv4 } = require('uuid');

/**
 * Import own packages
 */
const config = require('./config');

/**
 * Define global vars
 */
const dev = process.env.NODE_ENV !== 'production';
const sockets = [];
const colors = {
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    blue: "\u001b[34m",
    magenta: "\u001b[35m",
    cyan: "\u001b[36m",
    bright_red: "\u001b[31;1m",
    bright_green: "\u001b[32;1m",
    bright_yellow: "\u001b[33;1m",
    bright_blue: "\u001b[34;1m",
    bright_magenta: "\u001b[35;1m",
    bright_cyan: "\u001b[36;1m",
    reset: "\u001b[0m"
};

/**
 * Init logger and set log level
 */
global.log = require('simple-node-logger').createSimpleLogger({
    logFilePath: dev ? `${__dirname}/log/dark-chat.log` : `${process.env.SNAP_COMMON}/dark-chat.log`,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
});
global.log.setLevel(config.log.level);

/**
 * Setup the Telnet Server
 */
const server = net.createServer((socket) => {
    // Set socket vars
    socket.ready = false;
    socket.nickname = "Unknown";
    socket.uuid = uuidv4();
    sockets.push(socket);

    // Send hello
    hello(socket);

    /**
     * Socket data handler
     */
    socket.on('data', (data) => {
        const cleanData = data.toString().replace(/(\r\n|\n|\r)/gm, '');

        // Check if a nickname was set
        if(!socket.ready) {
            socket.nickname = cleanData;
            broadcast(socket, `${colors.yellow}${socket.nickname} joined${colors.reset}\n`);
            global.log.info(`[CONNECT][${socket.uuid}] ${socket.nickname} joined`);
            socket.ready = true;
            socket.write("\u001b[1A");
            socket.write("\u001b[2K");
            socket.write(`Hi ${colors.bright_red}${socket.nickname}${colors.reset}! If you need any help type: /help\n`);
            if(sockets.length < 2) {
                socket.write(`There is currently ${colors.yellow}${sockets.length}${colors.reset} person online\n\n`);
            } else {
                socket.write(`There are currently ${colors.yellow}${sockets.length}${colors.reset} people online\n\n`);
            }
            return;
        }

        // Check if the /help command was send
        if(cleanData === "/help") {
            socket.write("\n");
            socket.write(`${colors.yellow}Help:${colors.reset}\n`);
            socket.write("/help     | Shows this message\n");
            socket.write("/people   | Shows all available people\n");
            socket.write("/quit     | Terminates the connection\n");
            socket.write("/exit     | Terminates the connection\n");
            socket.write("\n\n");
            return;
        }

        // Check if the /people command was send
        if(cleanData === "/people") {
            socket.write("\n");
            socket.write(`${colors.yellow}People:${colors.reset}\n`);
            sockets.forEach((client) => {
                socket.write(`ID: ${client.uuid} | Nickname: ${client.nickname}\n`);
            });
            socket.write(`Total: ${sockets.length}`);
            socket.write("\n\n");
            return;
        }

        // Check if the /quit or /exit command was send
        if(cleanData === "/quit" || cleanData === "/exit") {
            socket.write("\u001B[2J");
            socket.write(`${colors.red}We never liked you!${colors.reset}\n`);
            socket.end();
            return;
        }

        // Check if the message isn't empty
        if(cleanData !== "") {
            broadcast(socket, `${colors.cyan}${socket.nickname}>${colors.reset} ${data.toString()}`);
            global.log.info(`[MESSAGE][${socket.uuid}] ${cleanData}`);
        }
    });

    /**
     * Socket disconnect handler
     */
    socket.on('end', () => {
        broadcast(socket, `${colors.yellow}${socket.nickname} left the chat${colors.reset}\n`);
        removeSocket(socket);
        global.log.info(`[DISCONNECT][${socket.uuid}] ${socket.nickname} left the chat`);
    });

    /**
     * Socket error handler
     */
    socket.on('error', (error) => {
        global.log.error(`[SOCKET] Error: ${error.message}`);
        removeSocket(socket);
    });
});

/**
 * Send hello message to socket
 *
 * @param socket
 */
const hello = (socket) => {
    socket.write("\u001B[2J");
    socket.write(colors.bright_green);
    socket.write("██████╗  █████╗ ██████╗ ██╗  ██╗     ██████╗██╗  ██╗ █████╗ ████████╗\n");
    socket.write("██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝    ██╔════╝██║  ██║██╔══██╗╚══██╔══╝\n");
    socket.write("██║  ██║███████║██████╔╝█████╔╝     ██║     ███████║███████║   ██║   \n");
    socket.write("██║  ██║██╔══██║██╔══██╗██╔═██╗     ██║     ██╔══██║██╔══██║   ██║   \n");
    socket.write("██████╔╝██║  ██║██║  ██║██║  ██╗    ╚██████╗██║  ██║██║  ██║   ██║   \n");
    socket.write("╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   \n");
    socket.write("\n");
    socket.write("Every aspect of human technology has a dark side, including computers...\n\n");
    socket.write(colors.reset);
    socket.write("\n");
    socket.write("Nickname: ");
};

/**
 * Broadcast a message to al sockets
 *
 * @param source
 * @param message
 */
const broadcast = (source, message) => {
    // Check if there are people left
    if (sockets.length === 0) {
        global.log.warn('[BROADCAST] There is no one left to send a message to!');
        return;
    }

    // Send message to all connected sockets
    sockets.forEach((socket) => {
        // Dont send any messages to the sender
        if (socket.uuid === source.uuid) return;

        // Check if a socket is ready
        if (!socket.ready) return;

        socket.write(message);
    });
};

/**
 * Helper function to remove a socket from the array
 *
 * @param socket
 */
const removeSocket = (socket) => {
    if(sockets.indexOf(socket) !== -1) {
        sockets.splice(sockets.indexOf(socket), 1);
    }
};

/**
 * Server error handler
 */
server.on('error', (error) => {
    global.log.error(`[SERVER] Error ${error.message}`);
});

/**
 * Boot the server
 */
server.listen(config.application.port, () => {
    global.log.info(`[SERVER] Listening at: localhost:${config.application.port}`);
});
