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
        ecranLogin.style.display = 'block';
    } else if (!data.err) {
        console.log(data.message);
        console.log('Go affichage');
        //CONNECTION OK
        ecranLogin.style.display = 'none';
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
            } else {
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

btnConnexion.addEventListener('click', saveToken);
document.getElementById('champToken').addEventListener('keydown',(e) => {
    if(e.key === 'Enter') saveToken();
});

function saveToken() {
    console.log('go');
    var champToken = document.getElementById('champToken').value.trim();
    console.log(champToken);
    localStorage.setItem('token', champToken);
    coWebSocket();
}

coWebSocket();


