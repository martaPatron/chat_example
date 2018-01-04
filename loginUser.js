let nameUser;
function loginchat() {
    let nick = document.getElementById('nick-name').value;
    nameUser = localStorage.getItem(nick);
    if (!nameUser) {
        localStorage.setItem(nick, nick);
        nameUser = nick;
    }
    nick = '';
    this.href = 'chatPage.html';
}

let login = document.getElementsByClassName('login')[0];
login.addEventListener('click', loginchat);
