let chat = [];

function RefreshChat() {
    chat = api_post()
    for (let i = 0; i < chat.length; i++) {
        document.getElementById('chattext').innerHTML += chat[i]
        document.getElementById('chattext').innerHTML += '<br>'
    }
}