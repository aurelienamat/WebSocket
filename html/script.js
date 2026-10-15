const loginForm = document.getElementById('login-form');
const ecranLogin = document.getElementById('ecranLogin');
const chatScreen = document.getElementById('chat-screen');
const messageForm = document.getElementById('message-form');

const template = document.getElementById('message-template');
const feed = document.getElementById('message-feed');
var token = localStorage.getItem('token');
var ws = null;

function joinWebSocketReply(data) {
    if (data.err) {
        console.log(data.message);
        localStorage.clear();
        console.log('Pas affichage');
        // location.reload();
        ecranLogin.style.display = 'grid';
    } else if (!data.err) {
        console.log(data.message);
        console.log('Go affichage');
        //CONNECTION OK
        ecranLogin.style.display = 'none';
        chatScreen.hidden = false;
    }
}

function printChat(data) {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.message__author').textContent = data.prenom;
    clone.querySelector('.message__text').textContent = data.message;

    if(localStorage.getItem('lastMessage') == data.id){
        clone.querySelector('.message__author').style.display = 'none';
    }

    console.log(data.id);
    console.log(localStorage.getItem('id'));

    if (data.id == localStorage.getItem('id')) {
        clone.querySelector('.message').classList.add('mine')
        console.log('mine');
    }

    feed.appendChild(clone);
    localStorage.setItem('lastMessage',data.id);
    feed.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    var messageInput = document.getElementById('message-input');
    messageInput.value = "";
    messageInput.focus();
}

function coWebSocket() {
    token = localStorage.getItem('token');
    //DEMARRAGE
    if (token) {

        if (ws) {
            ws.close();
            ws = null;
        }

        ws = new WebSocket('ws://localhost:3003');
        ws.addEventListener('message', (e) => {
            const data = JSON.parse(e.data);
            if (data.t === 'join') {
                console.log(data);
                localStorage.setItem('id', data.id);
                localStorage.setItem('prenom', data.prenom);
                localStorage.setItem('lastMessage',null);
                joinWebSocketReply(data);
            }
            if (data.t === 'chat') {
                console.log(data);
                printChat(data);
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


