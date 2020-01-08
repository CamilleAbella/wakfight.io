const http = require('http')
const fs = require('fs')
const fsp = fs.promises

// Chargement du fichier index.html affiché au client
const server = http.createServer(function(req, res) {
    fs.readFile('./app/index.html', 'utf8', async function(error, html) {

        if(error) throw error

        const adds = {}

        for(const subject of ['scripts','styles']){

            const names = await fsp.readdir(`./app/${subject}/`, 'utf8')

            let list = []

            for(const name of names.sort((a,b)=> Number(a.split('_')[0]) - Number(b.split('_')[0]) )){
                const item = await fsp.readFile(`./app/${subject}/${name}`, 'utf8')
                list.push(item)
            }

            adds[subject] = list.join('\n')

        }

        for(subject in adds){
            html = html.replace(`{{${subject}}}`, adds[subject])
        }

        res.writeHead(200, {"Content-Type": "text/html"})
        res.end(html)
    })
})

// Chargement de socket.io et du reste
const crypto = require('crypto')

const io = require('socket.io').listen(server)
const mysql = require('mysql2') 

const config = require('./config.json')
const db = mysql.createConnection(config.database)
console.log('connected to database')

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    socket.on('login', form => {
        const data = [form.pseudo,hash(form.password)]
        query('SELECT * FROM `user` WHERE `pseudo` = ? AND `password` = ?', data)
            .catch(console.error)
            .then(results => {
                if(results.length > 0){
                    socket.emit('logged', results[0])
                }else{
                    query('INSERT INTO user (pseudo, password) VALUES (?,?)', data)
                        .catch(console.error)
                        .then(fields => {
                            query('SELECT * FROM `user` WHERE `pseudo` = ? AND `password` = ?', data)
                                .catch(console.error)
                                .then(_results => {
                                    socket.emit('logged', _results[0])
                                })
                        })
                }
            })
    })

    socket.on('matchmaking', serialUser => {
        const user = JSON.parse(serialUser)
        query('SELECT * FROM `user` WHERE `id` != ? ORDER BY RAND() LIMIT 1', [user.id])
            .catch(console.error)
            .then(results => {
                if(results.length > 0){
                    const match = {
                        user: user,
                        opponent: results[0]
                    }
                    socket.emit('matchfound', user, match)
                }else{
                    socket.emit('usererror', 'Vous êtes le seul utilisateur...')
                }
            })
    })

})

server.listen(8080)

function query( request, values = [] ){
    return new Promise(( resolve, reject ) => {
        db.query(request, values, (error, results) => {
            if(error) reject(error.sqlMessage)
            resolve(results)
        })
    })
}

function hash( password ){
    return crypto.createHash('sha256').update(password).digest('base64')
}