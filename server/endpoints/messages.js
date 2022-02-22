const { servertime, getRequestToken } = require('./../local_modules/tools.js')
const jwt = require("./../local_modules/jwt.js")

exports.get = (app, db, config) => {
    return (req, res) => {
    
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

        db.select(db.tables.Messages, filters).then(rows => {
            const userIds = new Set()
            const messages = []
            for(const row of rows)
            {
                messages.push({
                    id: row.ID,
                    content: row.Message,
                    timesent: new Date(row.TimeSent).valueOf(),
                    userid: row.UserID,
                    username: null, // Will be filled later
                    channel: row.Channel,
                })

                userIds.add(row.UserID)
            }

            db.select(db.tables.UserAccount, [
                db.filters.in(db.tables.UserAccount.columns.ID, Array.from(userIds))
            ]).then(rows => {
                const usernames = {}
                for(const row of rows)
                {
                    usernames[row.ID] = row.Name
                }

                for(const idx in messages)
                {
                    messages[idx].username = usernames[messages[idx].userid] ?? '[Brugernavn Mangler]'
                }

                res.send({ success: true, messages })
            }).catch(reason => {
                res.send({
                    success: false,
                    messages: null,
                    error: reason
                })
            })
        }).catch(reason => {
            res.send({
                success:  false,
                messages: null,
                error:    reason,
            })
        })
    }
}

exports.post = (app, db, config) => {
    return (req, res) => {
        
        const { channelID } = req?.params ?? {}
        const { content } = req?.body ?? {}
        
        if(!content)
        {
            res.send({
                success: false,
                error: `Message content was undefined`
            })
            return
        }

        const { payload: { userid } } = jwt.decode(getRequestToken(req))

        db.insert(db.tables.Messages, {
            UserID: userid,
            Message: content,
            Channel: channelID ?? null
        }).then(_ => {
            res.send({
                success: true,
            })
        }).catch(reason => {
            res.send({
                success: false,
                error:   reason,
            })
        })
    }
}