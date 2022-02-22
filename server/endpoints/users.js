const tools = require("./../local_modules/tools.js")
const jwt = require("./../local_modules/jwt.js");

exports.delete = (app, db, config) => {
    return (req, res) => {

        console.log(tools.getRequestToken(req));

        const {payload:{userid}} = jwt.decode( tools.getRequestToken(req));

        
        if(!userid) {
            res.send({
                success: false,
                code: "ID MISSING",
                error: "No user with that id was found"
            })
            return
        }
        
        db.delete(db.tables.UserAccount, [
            db.filters.equals(db.tables.UserAccount.columns.ID, userid)
        ]).then(_ => {
            res.send({
                success: true,
                error: null
            })
        }).catch(reason => {
            console.warn(`Delete User Query failed: ${reason}`)
            res.send({
                success: false,
                code: "DELETE_FAILED",
                error: `Query Failed: ${reason}`
            })
        })
    }
}