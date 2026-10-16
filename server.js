const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { json } = require('stream/consumers');

const app = express();
const server = http.createServer(app);       // un seul serveur HTTP
const wss = new WebSocketServer({ server }); // le WS s'attache dessus, pas de port séparé

app.use(express.static('html'));
app.use(express.json());

var API = 'https://efe.tspro.fr';

async function recupPrenom(token) {
    var data = null;
    try {
        const response = await fetch(API + '/auth/verify-token', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'x-user-type': 'student'
            },
            body: JSON.stringify({ token: token })
        })

        if (!response.ok) {
            throw new Error('réponse HTTP ' + response.status);
        }

        data = await response.json();
        return data.eleve;

    } catch (err) {
        console.log('erreur api');
        console.log(data);
        return null;
    }

}

function sendUsers() {
    let users = [];
    wss.clients.forEach((user) => {
        users.push({ prenom: user.username, id: user.id });
    })
    wss.clients.forEach((user) => {
        user.send(JSON.stringify({ t: 'users', users: users }));
    })
    console.log(users);
}

//Lire sur le port 3003
server.listen(3003, () => {
    console.log('Server is running on :3003');
})

wss.on('connection', (socket) => {
    console.log('Client connecté');

    socket.on('message', async (data) => {
        const msg = JSON.parse(data.toString());
        console.log('reçu:', msg);

        if (msg.t === 'join') {
            const dataEleve = await recupPrenom(msg.token);

            if (!dataEleve) {
                socket.send(JSON.stringify({ t: 'join', err: true, message: 'Tentative join echoué' }));
                return;
            }

            console.log(dataEleve);
            socket.username = dataEleve.prenom;
            socket.id = dataEleve.id;

            //Envoyer la liste des eleves
            sendUsers();

            socket.send(JSON.stringify({ t: 'join', err: false, message: 'Tentative join success', prenom: socket.username, id: socket.id }));
            wss.clients.forEach((user) => {
                if (user.id == socket.id) return;
                user.send(JSON.stringify({ t: 'join', err: false, prenom: socket.username }));
            })
        }

        if (!socket.username) return;

        if (msg.t === 'chat') {
            wss.clients.forEach((user) => {
                user.send(JSON.stringify({ t: 'chat', prenom: socket.username, id: socket.id, message: msg.message }));
            })
        }

        if (msg.t === 'users') {
            sendUsers();
        }

    });

    socket.on('close', () => {
        console.log('Client déconnecté');
        //Envoyer la liste des users
        sendUsers();
        //Envoyer comme quoi le frerot se déco
        wss.clients.forEach((user) => {
            user.send(JSON.stringify({ t: 'close', err: false, prenom: socket.username }));
        })
    });
});