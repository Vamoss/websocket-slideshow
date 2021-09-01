const port = 7890;

//Express and Socket.io
const express = require('express');
const app = new express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// when a user conncect, we return all data to create the sea
io.on('connection', socket => {
    console.log('a user connected');

    socket.on('change', data => {
        console.log('on change', data);
        io.sockets.emit('change', data)
    });
});

app.use(express.static('./public'));

server.listen(port, () => console.log(`Server listening on port ${port}!`));