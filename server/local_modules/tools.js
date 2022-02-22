const jwt = require("./jwt.js")


/**
 * Removes the timezone offset from a date and returns it in ISO format.
 * 
 * Use this when passing a date to be used in a query
 * 
 * @param {Date} date The date to convert to servertime
 * 
 * @returns {string} The corrected date in ISO format
 */
exports.servertime = function servertime(date)
{
    const time = date.valueOf() - date.getTimezoneOffset() * 60 * 1000
    return (new Date(time)).toISOString()
}



const bearerPrefix = 'bearer '
exports.getRequestToken = function getRequestToken(req)
{
    let token = req.headers['authorization'] ?? req.body?.token ?? ''

    // Strip "Bearer " from the token, if present
    if(token.substring(0, bearerPrefix.length).toLowerCase() == bearerPrefix)
        token = token.substring(bearerPrefix.length)

    return token
}



/**
 * Creates a JWT payload
 * 
 * @param {Number} id The user ID
 * @param {String} username The username
 * @param {Number} ttl How long the JWT is valid (in millis)
 * 
 * @returns {Object} The JWT payload
 */
exports.createJWTPayload = function createJWTPayload(userid, username, expireSeconds)
{
    const nowTime = new Date()
    const expiresTime = (new Date(nowTime.valueOf() + (expireSeconds * 1000)))

    return {
        userid:   userid,
        username: username,
        issued:   nowTime.toISOString(),
        expires:  expiresTime.toISOString(),
    }
}

/**
 * Validates that a JWT token is valid and hasn't expired.
 * 
 * @param {String} token The JWT token to check
 * @param {String} secret The secret that the JWT token was signed with
 * 
 * @returns {Boolean} Whether the token is valid
 */
exports.checkJWTToken = function checkJWTToken(token, secret)
{
    const { payload } = jwt.decode(token)
    const expires = Date.parse(payload.expires)

    if(Number.isNaN(expires))
        return console.log("Payload expiration was NaN") ?? false
    
    if(expires < Date.now())
        return console.log("JWT has expired") ?? false

    return jwt.validate(token, secret)
}