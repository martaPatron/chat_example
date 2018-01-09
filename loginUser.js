console.log(localStorage);
function loginchat() {
    let nick = document.getElementById('nick-name').value;
    let user = localStorage.getItem('currentUser');
    if (!user) {
        if (nick) {
            let nameUser = localStorage.getItem(nick);
            if (!nameUser) {
                localStorage.setItem(nick, nick);
                nameUser = nick;
            }
            localStorage.setItem('currentUser', nick);
            nick = '';
        } else {
            return;
        }
    }
    this.href = 'chatPage.html';
}
let login = document.getElementsByClassName('login')[0];
login.addEventListener('click', loginchat);


