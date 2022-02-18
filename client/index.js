Send();
function Send(message){
    var searchParams = new URLSearchParams({msg: message}).toString;
    var response = api_post("message/send", searchParams);
    GetMessages();
}

function GetMessages(){
    var response = api_get("messages/get");
    var parsedData = JSON.parse(response);
    console.log(parsedData);
}