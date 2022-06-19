const http = require('http').createServer();
const EncryptionMachine = require('encdenc');
const io = require('socket.io')(http, {
    cors: { origin: '*' }
});


const machine = new EncryptionMachine();
machine.config = require('./_config.js')
console.log(machine.config);

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
})

http.listen(port, () => {
    console.log(`listening on port ${port}`)
})