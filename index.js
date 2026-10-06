var express = require('express');
var socket = require('socket.io');

var app = express();

var server = app.listen(4000, function(){
    console.log('Servidor corriendo en http://localhost:4000');
});

app.use(express.static('public'));

var io = socket(server, {
    maxHttpBufferSize: 50 * 1024 * 1024
});

io.on('connection', function(socket){

    console.log('Hay una conexion', socket.id);

    socket.on('chat', function(data){

        console.log(data);

        io.sockets.emit('chat', data);

    });

    socket.on('typing', function(data){

        socket.broadcast.emit('typing', data);

    });

    socket.on('archivo', function(data){

        console.log('Archivo recibido:', data.nombre);

        io.sockets.emit('archivo', data);

    });

});