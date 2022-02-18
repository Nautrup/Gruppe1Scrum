
const db = require("./local_modules/database.js")
const fs = require("fs")
const express = require("express")
const app = express()

const config = JSON.parse(fs.readFileSync(`${__dirname}/config/server.json`))
console.log("Server Config:")
for(const [key, value] of Object.entries(config))
{
    console.log(`    ${key} = ${value}`)
}
console.log("\n")

// Set the origin on all requests (CORS)
app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"])
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH")
    // res.append("Access-Control-Allow-Headers", "Content-Type")
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


app.get("/messages", (req, res) => {
    db.select(db.tables.Messages).then(rows => {
        res.append("Content-Type", "application/json")
        res.send(JSON.stringify(rows))
    }).catch(reason => {
        res.status(500)
        res.send(`Failed to fetch messages: ${reason}`)
    })
})

app.post("/messages", (req, res) => {
    const { name, message } = req.body

    // Make sure that neither name or message is null
    if(!name || !message) return void res.sendStatus(400)


    res.sendStatus(200)
})








app.listen(config.port, config.host, () => {
    console.log(`Server started on ${config.host}:${config.port}`)
})
