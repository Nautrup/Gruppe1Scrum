let messages = document.getElementById('chat_window');

function Send(){
    var message = document.getElementById('sendfield').value;
    var searchParams = new URLSearchParams({msg: message}).toString;
    var response = api_post("message/send", searchParams);
    GetMessages();
}

function GetMessages(){
    var response = api_get("messages/get");
    var parsedData = JSON.parse(response);
    console.log(parsedData);
    
    for (let i = 0; i < parsedData.length; i++) {
        var msg = parsedData[i].message;
        document.getElementById('chattext').innerHTML += '<p>' + msg + '</p>';
    }
    // let msg = document.getElementById("sendfield").value
    // document.getElementById('chattext').innerHTML += '<p>' + msg + '</p>';
    // document.getElementById('chattext').innerHTML += '<br>';
    // api_post(msg);

    shouldScroll = messages.scrollTop + messages.clientHeight === messages.scrollHeight;

    if (!shouldScroll) {
        scrollToBottom();
    }
    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }
}