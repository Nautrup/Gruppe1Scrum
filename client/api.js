function api_post(url, params)
{
    return new Promise((resolve, reject) => {
        fetch(
            `http://localhost:3000/${url}`,
            {
                body: (new URLSearchParams(params)).toString(),
                mode: 'cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    if(sessionStorage.getItem("token") != null){
        if(jwtVerify(sessionStorage.getItem("token")) == true){
            var token = sessionStorage.getItem("token").toString()
            return new Promise((resolve, reject) => {
                fetch(
                    `http://localhost:3000/${url}`,
                    {
                        mode: 'cors',
                        headers: { 'Authorization': `Bearer ${token}`},
                        method: 'GET'
                    }
                )
                .then(response => response.json())
                .then(json => resolve(json))
                .catch(reason => reject(reason))
            })
            
        } else {
            console.log("Token has expired");
            LogOut();
        }
    } else {
        return new Promise((resolve, reject) => {
            fetch(
                `http://localhost:3000/${url}`,
                {
                    mode: 'cors',
                    headers: {},
                    method: 'GET'
                }
            )
            .then(response => response.json())
            .then(json => resolve(json))
            .catch(reason => reject(reason))
        })
    }
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

function jwtVerify(token){
    var currentDate = new Date().getTime();
    var expireDate = new Date(jwtDecode(token).expires).getTime();
    
    if(currentDate < expireDate){
        return true;
    } else {
        return false;
    }
}