function SendMsg() {
    let msg = document.getElementById("sendfield").value
    document.getElementById('chattext').innerHTML += '<p>' + msg + '</p>';
    // document.getElementById('chattext').innerHTML += '<br>';
    // api_post(msg);

    shouldScroll = chatWindow.scrollTop + chatWindow.clientHeight === chatWindow.scrollHeight;

    if (!shouldScroll) {
        scrollToBottom();
      }
    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
}
