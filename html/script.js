const btnConnexion = document.getElementById('btnConnexion');
const ecranLogin = document.getElementById('ecranLogin');

var token = localStorage.getItem('token');
var ws = null;

function joinWebSocketReply(data) {
    if (data.err) {
        console.log(data.message);
        localStorage.clear();
        console.log('Pas affichage');
        // location.reload();
    } else if (!data.err) {
        console.log(data.message);
        console.log('Go affichage');
    }
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
                joinWebSocketReply(data);
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

coWebSocket();


//CONNECTION OK
// ecranLogin.style.display = 'none';

btnConnexion.addEventListener('click', () => {
    var champToken = document.getElementById('champToken').value.trim();
    console.log(champToken);
    localStorage.setItem('token', champToken);
    coWebSocket();
})