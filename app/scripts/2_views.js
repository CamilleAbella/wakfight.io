
function _home(user){
    $('#page').html(`
        <h1 class="text-secondary"> Profil de ${user.pseudo} </h1>
        <div class="btn-group">
            <button class="btn btn-primary" onclick="socket.emit('matchmaking', ${JSON.stringify(user).replace(/"/g,"'")})"> Trouver un match </button>
            <button class="btn btn-primary"> Changer le champion </button>
        </div>
    `)
}

function _match(match){
    $('#page').html(`
        <h1> Match trouvé contre ${match.opponent.pseudo} </h1>
        <button class="btn btn-success" onclick="_start('${JSON.stringify(match)}')"> Démarrer le combat </button>
    `)
}

function _start(serialMatch){
    const match = JSON.parse(serialMatch)
    console.log(match)
}