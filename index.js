const socket = io.connect('http://localhost:4563');

new Spuck(
    { type: 'h1', parent: '#app', class: 'mb-3' },
    { text: 'EncDenc <kbd>v1.0.3</kbd>' }
).make();

// Config Array Area
new Spuck({ type: 'div', parent: '#app', class: 'border p-2 mb-3', id: 'config' }).make();
new Spuck(
    { type: 'h4', parent: '#config' },
    { text: 'Config Array' }
).make();

const ConfigArray = new Spuck({ type: 'input', parent: '#config', class: 'w-100', id: 'config-input' }).render();
const setConfig = ConfigArray.$state('config', '1, 2, 3, 4, 5, 6, 7, 8, 9, 10');
ConfigArray.prop = { value: '$-config' };
ConfigArray.events = { input: e => setConfig(e.target.value) };
ConfigArray.make('re')

const ConfigArraySetterButton = Button({ parent: '#config', className: 'btn btn-primary', text: 'Set Config' });
ConfigArraySetterButton.events = { click: () => socket.emit('update-config', ConfigArray.getState('config')) }
ConfigArraySetterButton.make('re');


// Text Area
new Spuck({ type: 'div', parent: '#app', class: 'border p-2 mb-4', id: 'enc-text' }).make();
new Spuck(
    { type: 'h4', parent: '#enc-text' },
    { text: 'Text' }
).make();

const NormalText = new Spuck({ type: 'input', parent: '#enc-text', class: 'w-100 mb-3', id: 'normal-text' }).render();
const setText = NormalText.$state('text', '');
NormalText.prop = { value: '$-text' };
NormalText.events = {
    input: e => setText(e.target.value),
    keyup: e => {
        if (e.keyCode === 13)
            onType(e.target.value);
    }
};
NormalText.attr = { placeholder: 'Enter text', autocomplete: 'off', autocorrect: 'off', autofocus: true };
NormalText.make('re');


// Encrypted Text Area
new Spuck(
    { type: 'h4', parent: '#enc-text' },
    { text: 'Encryptions' }
).make();

const EncryptionArea = new Spuck({ type: 'div', parent: '#enc-text', class: 'bg-dark p-2', id: 'enc-area' }).render();
const setEncryptions = EncryptionArea.$state('encryptions', []);

EncryptionArea.$effect(() => {
    let text = EncryptionArea.getState('encryptions')[EncryptionArea.getState('encryptions').length - 1];
    if (!text) return;
    let TextEl = new Spuck({ type: 'p', parent: '#enc-area' }, { text: text.enc, css: { color: 'white' } });
    TextEl.attr = { title: text.dec };
    TextEl.events = {
        click: (e) => {
            navigator.clipboard.writeText(text.enc);
            e.target.id = 'copied';
            setTimeout(() => {
                e.target.id = '';
            }, 300);
        }
    }
    TextEl.render()
    TextEl = TextEl.el
    EncryptionArea.el.innerHTML = '';
    EncryptionArea.el.appendChild(TextEl);
    EncryptionArea.el.scrollTop = EncryptionArea.el.scrollHeight;
}, ['$-encryptions']);

EncryptionArea.make('re');



// Decryption Area
new Spuck({ type: 'div', parent: '#app', class: 'border p-2', id: 'dec-text' }).make();
new Spuck(
    { type: 'h4', parent: '#dec-text' },
    { text: 'Encrypted Text' }
).make();

const EncTextInput = new Spuck({ type: 'input', parent: '#dec-text', class: 'w-100 mb-3' }).render();
const setEncText = EncTextInput.$state('enc-text', '');
EncTextInput.prop = { value: '$-enc-text' };
EncTextInput.events = {
    input: e => setEncText(e.target.value),
    keyup: e => {
        if (e.keyCode === 13)
            socket.emit('enc-text', e.target.value)
    }
};
EncTextInput.attr = { placeholder: 'Enter encrypted text', autocomplete: 'off', autocorrect: 'off', autofocus: true };
EncTextInput.make('re');

const DecryptedText = new Spuck({ type: 'div', parent: '#dec-text', class: 'bg-dark p-2', id: 'dec-area' }).render();
const setDecryption = DecryptedText.$state('decryption', '');
DecryptedText.prop = { value: '$-decryption' };

DecryptedText.$effect(() => {
    let text = DecryptedText.getState('decryption');
    if (!text) return;
    let TextEl = new Spuck({ type: 'p', parent: '#dec-area' }, { text: text, css: { color: 'white' } }).render();
    TextEl = TextEl.el
    DecryptedText.el.innerHTML = '';
    DecryptedText.el.appendChild(TextEl);
}, ['$-decryption']);

DecryptedText.make('re');


function onType(text) {
    setText(text);
    socket.emit('dec-text', text);
}

function Button({ parent, className, text }) {
    const _Button = new Spuck({ type: 'button', parent: parent, class: className + ' mt-2' });
    _Button.prop = { text };
    return _Button.render();
}

socket.on('encrypted-text', (enc, dec) => setEncryptions(prev => [...prev, { enc, dec }]));
socket.on('decrypted-text', dec => setDecryption(dec));
socket.on('config-updated', () => {
    setText('');
    setEncText('');
    setDecryption('');
    setEncryptions([]);
    EncryptionArea.el.innerHTML = '';
    DecryptedText.el.innerHTML = '';
})