let messages = document.getElementById('chat_window');

function Send(){
    var message = document.getElementById('sendfield').value;
    var searchParams = new URLSearchParams({msg: message}).toString;
    var response = api_post("messages/0", searchParams);
    GetMessages();
}

function GetMessages(){
    var response = api_get("messages/0");
    var parsedData = JSON.parse(response);
    console.log(parsedData);
    
    for (let i = 0; i < parsedData.length; i++) {
        var msg = parsedData[1].content[i];
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

function Login(){
    var usern = document.getElementById('Username');
    var passw = document.getElementById('Password');
    var searchParams = new URLSearchParams({username: usern, password: passw}).toString;
    var response = api_post("authorize/login", searchParams);
}

function Register(){
    var usern = document.getElementById('Username');
    var passw = document.getElementById('Password');
    var searchParams = new URLSearchParams({username: usern, password: passw}).toString;
    var response = api_post("user", searchParams);
}

function RenewJWT(){
    var searchParams = new URLSearchParams({token: token}).toString;
    var response = api_post("authorize/renew", searchParams);
}