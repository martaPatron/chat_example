console.log(localStorage);
function loginchat() {
    let nick = document.getElementById('nick-name').value;
    let nameUser = localStorage.getItem(nick);
    if (!nameUser) {
        localStorage.setItem(nick, nick);
        nameUser = nick;
        console.log('nameUser is');
    }
    localStorage.setItem('currentUser', nick);
    nick = '';
    this.href = 'chatPage.html';
    console.log(localStorage);
}

let login = document.getElementsByClassName('login')[0];
login.addEventListener('click', loginchat);
