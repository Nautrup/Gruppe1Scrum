document.getElementById("sendfield").addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById("submit_button").click();
        document.getElementById("sendfield").value = '';    
    }
});