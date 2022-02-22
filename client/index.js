let chatWindow = document.getElementById('chat_window');

window.setInterval(GetMessages, 3000)

console.log(sessionStorage.getItem("token"));

function Send()
{
    var message = document.getElementById('sendfield').value;
    api_post("messages/0", {content: message}).then(json => {
        console.log(json)
    })
    GetMessages();
    document.getElementById("sendfield").value = '';
}

function GetMessages()
{
    document.getElementById('logged').innerHTML = "Bruger: " + jwtDecode(sessionStorage.getItem("token")).username
    api_get("messages/0").then(response => {
        console.log(response);
        if(!response.success)
        {
            console.log(response.code);
            if(response.code == 'UNAUTHORIZED')
            {
                LogOut();
                return;
            }
            console.log(new Error("API FAILED: " + response.error))
            return;
        }
        
        
        let oldMessages = document.getElementById('chattext').childElementCount;
        for (let i = oldMessages; i < response.messages.length; i++)
        {
            let msg = response.messages[i];
            let date = new Date(msg.timesent);
            let format = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            if (msg.userid != jwtDecode(sessionStorage.getItem("token")).userid) {
            document.getElementById('chattext').innerHTML += 
                `<div class="messageBoxOther">` + 
                    '<ul>' +
                        '<li class="date">' + format + " - " + msg.username + '</li>' +
                        '<li class="message">' + msg.content + '</li>' + 
                    '</ul>' +  
                '</div>';
            } else {
                document.getElementById('chattext').innerHTML += 
                `<div class="messageBoxMe">` + 
                    '<ul>' +
                        '<li class="date">' + format + " - " + msg.username + '</li>' +
                        '<li class="message">' + msg.content + '</li>' +  
                    '</ul>'+
                '</div>';
            }
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

