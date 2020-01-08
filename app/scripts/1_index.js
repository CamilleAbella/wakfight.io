
const socket = io.connect('http://localhost:8080');
var user = null

$('form').on( 'submit', event => event.preventDefault())

socket.on('logged', user => {
    _home(user)
})

socket.on('matchfound', match => {
    _match(match)
})

socket.on('usererror', (user, error) => {
    _home(user)
    alert(error)
})

function formToObject( form ){
    const serial = $(form).serializeArray()
    const object = {}
    for(input of serial)
    object[input.name] = input.value
    return object
}

function login( form ){
    const logData = formToObject(form)
    socket.emit('login',logData)
    return false
}