const { servertime } = require('./../local_modules/tools.js')

exports.get = (app, db) => {
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
    }
}

exports.post = (app, db) => {
    return (req, res) => {
        
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
    }
}