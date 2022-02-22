
exports.post = (app, db, config) => {
    return (req, res) => {

        const { uname, pword } = req?.body ?? {}

        if(!uname || !pword)
        {
            res.send({
                success: false,
                code: "MISSING_FIELD",
                error: "uname or pword is missing"
            })
            return
        }

        db.select(db.tables.UserAccount, [
            db.filters.equals(db.tables.UserAccount.columns.Name, uname)
        ]).then(rows => {
            if(rows.length)
            {
                res.send({
                    success: false,
                    code: "USERNAME_TAKEN",
                    error: "The username is already taken"
                })
                return
            }

            db.insert(db.tables.UserAccount, {
                Name: uname,
                Password: pword
            }).then(_ => {
                res.send({
                    success: true,
                    error: null
                })
            }).catch(reason => {
                console.warn(`Signup Insert Query failed: ${reason}`)
                res.send({
                    success: false,
                    code: "INSERT_FAILED",
                    error: `Query Failed: ${reason}`
                })
            })
        }).catch(reason => {
            console.warn(`Signup Select Query failed: ${reason}`)
            res.send({
                success: false,
                code: "SELECT_FAILED",
                error: `Query Failed: ${reason}`
            })
        })
    }
}