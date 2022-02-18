function api_post(url, searchParams){
    fetch(`http://127.0.0.1:8080/${url}`, {
        body: searchParams,
        mode: 'cors',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        method: 'post'
    }).then(function(res){ return "Hello"})
}

function api_get(url){
    fetch(`http://127.0.0.1:8080/${url}`, {
        mode: 'cors',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        method: 'get'
    }).then(function(res){ return "Hello"})
}