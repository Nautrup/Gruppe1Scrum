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