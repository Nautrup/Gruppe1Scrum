let messages = document.getElementById('chat_window');

document.getElementById("sendfield").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
     event.preventDefault();
     document.getElementById("submit_button").click();
    }});

function SendMsg() {
    let msg = document.getElementById("sendfield").value
    document.getElementById('chattext').innerHTML += '<p>' + msg + '</p>';
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