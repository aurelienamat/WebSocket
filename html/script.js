const loginForm = document.getElementById('login-form');
const ecranLogin = document.getElementById('ecranLogin');
const chatScreen = document.getElementById('chat-screen');
const messageForm = document.getElementById('message-form');

const template = document.getElementById('message-template');
const feed = document.getElementById('message-feed');

//Liste des users
const userList = document.getElementById('user-list'); //ul
const userTemplate = document.getElementById('user-template'); //template

//Event join close
const joinTemplate = document.getElementById('join-template');

var token = localStorage.getItem('token');
var ws = null;

function eventJoinClose(data, event) {
    const clone = joinTemplate.content.cloneNode(true);

    clone.querySelector('.join__prenom').textContent = data.prenom;
    clone.querySelector('.join__event').textContent = event;

    feed.appendChild(clone);
    localStorage.setItem('lastMessage', null);
}

function joinWebSocketReply(data) {
    if (data.err) {
        console.log(data.message);
        localStorage.clear();
        console.log('Pas affichage');
        // location.reload();
        ecranLogin.style.display = 'grid';
    } else if (!data.err) {
        if (data.message) {
            console.log('pas deja co');
            localStorage.setItem('id', data.id);
            localStorage.setItem('prenom', data.prenom);
            localStorage.setItem('lastMessage', null);
        }
        console.log(data.message);
        console.log('Go affichage');
        //CONNECTION OK
        ecranLogin.style.display = 'none';
        chatScreen.hidden = false;
        eventJoinClose(data, 'join');
    }
}

function printChat(data) {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.message__author').textContent = data.prenom;
    clone.querySelector('.message__text').textContent = data.message;

    if (localStorage.getItem('lastMessage') == data.id) {
        clone.querySelector('.message__author').style.display = 'none';
    }

    console.log(data.id);
    console.log(localStorage.getItem('id'));

    if (data.id == localStorage.getItem('id')) {
        clone.querySelector('.message').classList.add('mine')
        console.log('mine');
    }

    feed.appendChild(clone);
    localStorage.setItem('lastMessage', data.id);
    feed.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    var messageInput = document.getElementById('message-input');
    messageInput.value = "";
    messageInput.focus();
}

function printUsers(data) {
    userList.replaceChildren();
    console.log(data);
    data.users.forEach(user => {
        const clone = userTemplate.content.cloneNode(true);
        clone.querySelector('.user__prenom').textContent = user.prenom;
        clone.querySelector('.user__photo').src = user.photo;
        userList.appendChild(clone);
        console.log(user);
    });
}

function coWebSocket() {
    token = localStorage.getItem('token');
    //DEMARRAGE
    if (token) {

        if (ws) {
            ws.close();
            ws = null;
        }

        ws = new WebSocket('ws://172.29.18.172:3003');
        ws.addEventListener('message', (e) => {
            const data = JSON.parse(e.data);
            if (data.t === 'join') {
                console.log('msg : join');
                console.log(data);
                joinWebSocketReply(data);
            }
            if (data.t === 'chat') {
                console.log('msg : chat');
                console.log(data);
                printChat(data);
            }
            if (data.t === 'users') {
                console.log('msg : users');
                printUsers(data);
            }
            if (data.t === 'close') {
                console.log('msg : close');
                if (data.err) return;
                eventJoinClose(data, 'leave');
            }
        });

        console.log('token trouvé');
        ws.addEventListener('open', () => {
            ws.send(JSON.stringify({ t: 'join', token: token }));
            console.log('envoyé');
        });

    } else {
        console.log('Pas de token');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();          // annule le rechargement
    console.log('go');
    var champToken = document.getElementById('champToken').value.trim();
    console.log(champToken);
    localStorage.setItem('token', champToken);
    coWebSocket();
});

// function afficherMessageUser(message) {
//     const clone = template.content.cloneNode(true);

//     clone.querySelector('.message__author').textContent = auteur;
//     clone.querySelector('.message__text').textContent = texte;
// }

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Go message');
    const messageInput = document.getElementById('message-input').value.trim();
    ws.send(JSON.stringify({ t: 'chat', message: messageInput }));
})


coWebSocket();


