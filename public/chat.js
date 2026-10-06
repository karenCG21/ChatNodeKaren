var socket = io.connect('http://localhost:4000');

var persona = document.getElementById('persona'),
    appChat = document.getElementById('app-chat'),
    panelBienvenida = document.getElementById('panel-bienvenida'),
    usuario = document.getElementById('usuario'),
    mensaje = document.getElementById('mensaje'),
    botonEnviar = document.getElementById('enviar'),
    archivo = document.getElementById('archivo'),
    escribiendoMensaje = document.getElementById('escribiendo-mensaje'),
    output = document.getElementById('output');


// COLORES PARA CADA USUARIO
var coloresUsuarios = [
    '#2563eb',
    '#7c3aed',
    '#059669',
    '#ea580c',
    '#db2777',
    '#0891b2',
    '#ca8a04'
];

function obtenerColorUsuario(nombre) {

    var suma = 0;

    for (var i = 0; i < nombre.length; i++) {
        suma += nombre.charCodeAt(i);
    }

    return coloresUsuarios[suma % coloresUsuarios.length];
}


// SONIDO
function reproducirSonido() {

    var audioContext = new (
        window.AudioContext || window.webkitAudioContext
    )();

    var oscilador = audioContext.createOscillator();
    var ganancia = audioContext.createGain();

    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);

    oscilador.frequency.value = 600;
    ganancia.gain.value = 0.1;

    oscilador.start();

    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.2
    );

    oscilador.stop(audioContext.currentTime + 0.2);
}


// ENVIAR MENSAJE Y ARCHIVO
botonEnviar.addEventListener('click', function () {

    // Verificar si hay un archivo seleccionado
    if (archivo.files.length > 0) {

        var file = archivo.files[0];

        console.log("Archivo seleccionado:", file.name);
        console.log("Tipo:", file.type);
        console.log("Tamaño:", file.size);

        var lector = new FileReader();

        lector.onload = function (e) {

            console.log("Archivo leído correctamente");

            socket.emit('archivo', {
                usuario: usuario.value,
                nombre: file.name,
                tipo: file.type,
                archivo: e.target.result
            });

            console.log("Archivo enviado por Socket.IO");

            reproducirSonido();

            archivo.value = '';
        };

        lector.onerror = function () {
            console.error("Error al leer el archivo");
        };

        lector.readAsDataURL(file);
    }

    // Enviar mensaje de texto
    if (mensaje.value) {

        socket.emit('chat', {
            mensaje: mensaje.value,
            usuario: usuario.value
        });

        reproducirSonido();

        mensaje.value = '';
    }

});


// ESCRIBIENDO
mensaje.addEventListener('keyup', function () {

    if (persona.value) {

        socket.emit('typing', {
            nombre: usuario.value,
            texto: mensaje.value
        });

    }

});


// RECIBIR MENSAJES
socket.on('chat', function (data) {

    escribiendoMensaje.innerHTML = '';

    var colorUsuario = obtenerColorUsuario(data.usuario);

    output.innerHTML +=
        '<p><strong style="color:' + colorUsuario + ';">' +
        data.usuario +
        ': </strong>' +
        data.mensaje +
        '</p>';

});


// RECIBIR ARCHIVOS
socket.on('archivo', function (data) {

    escribiendoMensaje.innerHTML = '';

    var contenido = '';
    var colorUsuario = obtenerColorUsuario(data.usuario);

    // IMAGEN
    if (data.tipo.startsWith('image/')) {

        contenido =
            '<p><strong style="color:' + colorUsuario + ';">' +
            data.usuario +
            ': </strong><br>' +
            '<img src="' +
            data.archivo +
            '" width="200">' +
            '<br><a href="' +
            data.archivo +
            '" download="' +
            data.nombre +
            '">Descargar imagen</a></p>';

    }

    // VIDEO
    else if (data.tipo.startsWith('video/')) {

        contenido =
            '<p><strong style="color:' + colorUsuario + ';">' +
            data.usuario +
            ': </strong><br>' +
            '<video width="300" controls>' +
            '<source src="' +
            data.archivo +
            '" type="' +
            data.tipo +
            '">' +
            '</video><br>' +
            '<a href="' +
            data.archivo +
            '" download="' +
            data.nombre +
            '">Descargar video</a></p>';

    }

    // AUDIO
    else if (data.tipo.startsWith('audio/')) {

        contenido =
            '<p><strong style="color:' + colorUsuario + ';">' +
            data.usuario +
            ': </strong><br>' +
            '<audio controls>' +
            '<source src="' +
            data.archivo +
            '" type="' +
            data.tipo +
            '">' +
            '</audio><br>' +
            '<a href="' +
            data.archivo +
            '" download="' +
            data.nombre +
            '">Descargar audio</a></p>';

    }

    // OTROS ARCHIVOS
    else {

        contenido =
            '<p><strong style="color:' + colorUsuario + ';">' +
            data.usuario +
            ': </strong>' +
            '<br>Archivo: ' +
            data.nombre +
            '<br><a href="' +
            data.archivo +
            '" download="' +
            data.nombre +
            '">Descargar archivo</a></p>';

    }

    output.innerHTML += contenido;

    reproducirSonido();

});


// INDICADOR DE ESCRITURA
socket.on('typing', function (data) {

    if (data.texto) {

        escribiendoMensaje.innerHTML =
            '<p><em>' +
            data.nombre +
            ' esta escribiendo un mensaje...</em></p>';

    }
    else {

        escribiendoMensaje.innerHTML = '';

    }

});


// INGRESAR AL CHAT
function ingresarAlChat() {

    if (persona.value) {

        panelBienvenida.style.display = "none";

        appChat.style.display = "block";

        var nombreDeUsuario = persona.value;

        usuario.value = nombreDeUsuario;

        usuario.readOnly = true;

    }

}