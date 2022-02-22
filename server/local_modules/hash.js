const crypto = require('crypto')

const hashPrefix = "$HASHED$@$"

/**
 * Generates a random hex string of a given length.
 * 
 * @param {Number} length The length of the generated hex string
 * 
 * @returns {String} The randomly generated hex string
 */
exports.generateSalt = function generateSalt(length)
{
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0, length)
}

/**
 * Hashes a string with sha512 using a salt.
 * 
 * @param {String} value The value to hash
 * @param {String} salt The salt to use when hashing
 * 
 * @return {String} The resulting salted hash
 */
exports.hash = function hash(algorithm, value, salt)
{
    return `${hashPrefix}${Buffer.from(algorithm).toString('hex')}$${salt}$${crypto.createHmac(algorithm, salt).update(value).digest('hex')}`
}

exports.verify = function verify(hash, value)
{
    if(hash.substring(0, hashPrefix.length) != hashPrefix)
    {
        return hash == value
    }
    hash = hash.substring(hashPrefix.length)

    const [ algorithmHex, salt, ourValue ] = hash.split('$')
    const algorithm = Buffer.from(algorithmHex, 'hex').toString('utf-8')
    const hashedValue = exports.hash(algorithm, value, salt)
    return hashedValue == hash
}