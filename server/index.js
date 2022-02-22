
const db = require("./local_modules/database.js")
const fs = require("fs")
const express = require("express")
const app = express()

const endpoints = {
    messages: require("./endpoints/messages.js"),
    authorize: require("./endpoints/authorize.js"),
    signup: require("./endpoints/signup.js"),
}

const config = JSON.parse(fs.readFileSync(`${__dirname}/config/server.json`))
console.log("Server Config:")
;(() => {
    const pairs = Object.entries(config)
    while(pairs.length)
    {
        const [key, value] = pairs.shift()
        if(typeof value == "object")
        {
            for(const [subkey, subvalue] of Object.entries(value))
            {
                pairs.push([ `${key}.${subkey}`, subvalue ])
            }
            continue
        }

        console.log(`    ${key} = ${value}`)
    }
})()
console.log("\n")


// Set the origin on all requests (CORS)
app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"])
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH")
    res.append("Access-Control-Allow-Headers", "Content-Type")
    res.append("Origin", config.host)
    next()
})

// Enable urlencoded post requests
app.use(express.urlencoded({extended: true}))

// Log when requests are served
app.use((req, res, next) => {
    console.log(`Served: [${req.method}] ${req.url}`)
    next()
})

/////////////////////////////
// Authorization management
/////////////////////////////

app.use((req, res, next) => {
    // TODO: Implement check against JWT token being included
    next()
})


/////////////////////////////
// Actual endpoints
/////////////////////////////

app.get("/", (req, res) => {
    res.send("Bonjour! This is the backend speaking?!")
})

app.get("/messages/:ID", endpoints.messages.get(app, db, config))
app.post("/messages/:ID", endpoints.messages.post(app, db, config))

app.post("/authorize/login", endpoints.authorize.login_post(app, db, config))
app.post("/authorize/renew", endpoints.authorize.renew_post(app, db, config))

app.post("/users", endpoints.signup.post(app, db, config))








app.listen(config.port, config.host, () => {
    console.log(`Server started on ${config.host}:${config.port}`)
})
