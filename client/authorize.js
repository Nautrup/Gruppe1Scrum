function Login(){
    var usern = document.getElementById('Username').value;
    var passw = document.getElementById('Password').value;
    var response = api_post("authorize/login", {uname: usern, pword: passw}).then(response => {
        if(!response.success)
        throw new Error("API FAILED: " + response.error)

        sessionStorage.setItem("token", response.token);
        location.href = "index.html"
    })
}

function LogOut(){
    sessionStorage.clear();
    location.href = "login.html"
}

function Register(){
    var usern = document.getElementById('Username');
    var passw = document.getElementById('Password');
    var response = api_post("user", {username: usern, password: passw});
}

function RenewJWT(){
    var response = api_post("authorize/renew", {token: token});
}