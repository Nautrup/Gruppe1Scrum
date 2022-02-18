function api_post(args = "") {
    let body = "";
    if (args != null || args != undefined){
        body = args
    }

    fetch('http://127.0.0.1:8080', {
        method: 'post',
        mode: 'cors',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(function(response) { 
        return 'Hello' 
    })
}