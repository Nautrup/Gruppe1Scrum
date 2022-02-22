let chatWindow = document.getElementById('chat_window');

window.setInterval(GetMessages, 3000)

console.log(sessionStorage.getItem("token"));

function Send(){
    var message = document.getElementById('sendfield').value;
    api_post("messages/0", {id: 1, content: message}).then(json => {
        console.log(json)
    })
    GetMessages();
    document.getElementById("sendfield").value = '';
}

function GetMessages(){
    
    api_get("messages/0").then(response => {
        if(!response.success)
        throw new Error("API FAILED: " + response.error)
        
        let oldMessages = document.getElementById('chattext').childElementCount;
        for (let i = oldMessages; i < response.messages.length; i++)
        {
            let msg = response.messages[i].content;
            document.getElementById('chattext').innerHTML += '<p>' + msg + '</p>';
        }
    
        let shouldScroll = chatWindow.scrollTop + chatWindow.clientHeight === chatWindow.scrollHeight;
    
        if (!shouldScroll) {
            scrollToBottom();
        }
        function scrollToBottom() {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    })
}

