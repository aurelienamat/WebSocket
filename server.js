const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');

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
        return data.eleve.prenom;

    } catch (err) {
        console.log('erreur api');
        console.log(data);
        return null;
    }

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
            socket.username = await recupPrenom(msg.token);
            if (!socket.username) {
                socket.send(JSON.stringify({t : 'join', err : true, message: 'Tentative join echoué'}));
                return;
            }

            wss.clients.forEach((user) => {
                user.send(JSON.stringify({ t: 'join', err : false, message: 'Tentative join success', prenom: socket.username }));
            })
        }

        if (!socket.username) return;

        if (msg.t === 'chat') {
            wss.clients.forEach((user) => {
                user.send(JSON.stringify({ t: 'chat', prenom: socket.username, message: msg.message }));
            })
        }

        if (msg.t === 'users') {
            let users = [];
            wss.clients.forEach((user) => {
                users.push(user.username);
            })
            socket.send(JSON.stringify({ t: 'users', users: users }));
            console.log(users);
        }

    });
});