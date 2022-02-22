function api_post(url, params)
{
    var headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    var token = sessionStorage.getItem("token")
    if(jwtVerify(token))
    {
        headers["Authorization"] = `Bearer ${token}`
    }

    return new Promise((resolve, reject) => {
        fetch(
            `http://localhost:3000/${url}`,
            {
                body: (new URLSearchParams(params)).toString(),
                mode: 'cors',
                headers: headers,
                method: 'POST'
            }
        )
        .then(response => response.json())
        .then(json => void resolve(json))
        .catch(reason => void reject(reason))
    })
}

function api_get(url)
{
    var headers = {};
   
    if(jwtVerify(sessionStorage.getItem("token")))
    {
        var token = sessionStorage.getItem("token").toString()
        headers['Authorization'] = 'Bearer ' + token
    }
    
    return new Promise((resolve, reject) => {
        fetch(
            `http://localhost:3000/${url}`,
            {
                mode: 'cors',
                headers: headers,
                method: 'GET'
            }
        )
        .then(response => response.json())
        .then(json => resolve(json))
        .catch(reason => reject(reason))
    })
}

function jwtDecode(token)
{
    if(typeof(token) != 'string')
        return null
    try
    {
        return JSON.parse(atob(token.split('.')[1]))
    }
    catch(e)
    {
        console.warn(e)
        return null
    }
}

function jwtVerify(token)
{
    if(token == null) return false
            
    var currentDate = new Date().getTime();
    var expireDate = new Date(jwtDecode(token).expires).getTime();
    
    if(currentDate >= expireDate) return false;

    return true;
}