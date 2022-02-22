


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
