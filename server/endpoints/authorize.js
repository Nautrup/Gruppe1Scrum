const tools = require("./../local_modules/tools.js")
const jwt = require("./../local_modules/jwt.js")
const hash = require("./../local_modules/hash.js")

exports.login_post = (app, db, config) => {
    return (req, res) => {

        const { uname = null, pword = null } = req?.body ?? {}

        console.log(req.body)
        if(!uname || !pword)
        {
            res.send({
                success: false,
                error: `Either username or password is missing`
            })
            return
        }

        db.select(db.tables.UserAccount, [
            db.filters.equals(db.tables.UserAccount.columns.Name, uname),
            db.filters.limit(null, 1),
        ]).then(rows => {
            if(rows.length != 1 || !hash.verify(rows[0].Password, pword))
            {
                res.send({
                    success: true,
                    token: null,
                    debug_til_gronne: "bruger eller password er forkert, derfor er token null"
                })
                return
            }

            const user = rows[0]
            res.send({
                success: true,
                token: jwt.encode(
                    tools.createJWTPayload(
                        user.ID,
                        user.Name,
                        config.jwt.lifetime
                    ),
                    config.jwt.secret
                )
            })
        }).catch(reason => {
            console.warn("Login query failed: ", reason)
            res.send({
                success: false,
                error: `User fetch query failed [${reason}]`
            })
        })
    
    }
}

exports.renew_post = (app, db, config) => {
    return (req, res) => {
        res.send({
            success: false,
            error: "not implemented yet"
        })
    }
}