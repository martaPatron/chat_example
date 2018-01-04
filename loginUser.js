function loginchat() {
    let nick = document.getElementById('nick-name').value;
    let name = localStorage.getItem(nick);
    console.log(localStorage);
    if (name) {
        console.log(name);
    } else {
        localStorage.setItem(nick, nick);
        console.log(`set item ${nick}`);
    }
    nick = '';
    this.href = 'chatPage.html';
}

let login = document.getElementsByClassName('login')[0];
login.addEventListener('click', loginchat);
