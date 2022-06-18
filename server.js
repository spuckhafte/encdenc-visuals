const http = require('http').createServer();
const EncryptionMachine = require('encdenc');
const io = require('socket.io')(http, {
    cors: { origin: '*' }
});


const machine = new EncryptionMachine();
machine.config = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const port = process.env.PORT || 4563;

io.on('connection', socket => {
    console.log('a user connected');
    socket.on('dec-text', text => {
        let enc = machine.encrypt(text);
        socket.emit('encrypted-text', enc, text);
    })

    socket.on('enc-text', text => {
        let dec = machine.decrypt(text);
        socket.emit('decrypted-text', dec);
    })

    socket.on('update-config', config => {
        machine.config = config.split(',').map(Number);
        socket.emit('config-updated');
    })
})

http.listen(port, () => {
    console.log(`listening on port ${port}`)
})