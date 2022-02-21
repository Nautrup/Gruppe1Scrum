
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

/**
 * Removes the timezone offset from a date and returns it in ISO format.
 * 
 * Use this when passing a date to be used in a query
 * 
 * @param {Date} date The date to convert to servertime
 * 
 * @returns {string} The corrected date in ISO format
 */
function servertime(date)
{
    const time = date.valueOf() - date.getTimezoneOffset() * 60 * 1000
    return (new Date(time)).toISOString()
}

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

app.get("/messages/:ID", (req, res) => {
    
    const { channelID } = req?.params ?? {}
    const { after, before, limit } = req?.query ?? {}

    let filters = []
    if(channelID == undefined)
        filters.push(db.filters.isnull(db.tables.Messages.columns.Channel))
    else
        filters.push(db.filters.equals(db.tables.Messages.columns.Channel, channelID))
    
    if(after !== undefined && Number.isInteger(+after))
        filters.push(db.filters.greaterequals(db.tables.Messages.columns.TimeSent, servertime(new Date(+after))))

    if(before !== undefined && Number.isInteger(+before))
        filters.push(db.filters.lessequals(db.tables.Messages.columns.TimeSent, servertime(new Date(+before))))

    if(limit !== undefined && Number.isInteger(+limit))
        filters.push(db.filters.limit(null, +limit))

    res.append("Content-Type", "application/json")
    db.select(db.tables.Messages, filters).then(rows => {
        const messages = []
        for(const row of rows)
        {
            messages.push({
                id: row.ID,
                content: row.Message,
                timesent: new Date(row.TimeSent).valueOf(),
                userid: row.UserID,
                username: 'ikke udfyldt endnu',
                channel: row.Channel,
            })
        }
        res.send({ success: true, messages })
    }).catch(reason => {
        res.send({
            success:  false,
            messages: null,
            error:    reason,
        })
    })
})

app.post("/messages/:ID", (req, res) => {
    
    const { channelID } = req?.params ?? {}
    const { id, content } = req?.body ?? {}
    
    if(!content)
        return void res.send({ success: false, error: `Message content was undefined` })

    res.append("Content-Type", "application/json")
    db.insert(db.tables.Messages, {
        UserID: id,
        Message: content,
        Channel: channelID ?? null
    }).then(result => {
        res.send({
            success: true,
        })
    }).catch(reason => {
        res.send({
            success: false,
            error:   reason,
        })
    })
})








app.listen(config.port, config.host, () => {
    console.log(`Server started on ${config.host}:${config.port}`)
})
