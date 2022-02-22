const crypto = require('crypto')

/**
 * Encodes a JWT token, given the payload and the secret
 * 
 * @param {Object} payload The JWT token payload
 * @param {string} secret The secret used to generate the signature
 * @param {Object} [header=null] The JWT token headers
 * 
 * @returns {string} The encoded JWT token string
 */
exports.encode = function encode(payload, secret, header = null)
{
    const parts = [
        Buffer.from(JSON.stringify(header ?? {
            alg: 'HS256',
            typ: 'JWT',
        }), 'utf8').toString('base64url'),
        Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
    ]

    parts.push(
        crypto.createHmac('sha256', secret)
            .update(parts.join('.'))
            .digest('base64url'))

    return parts.join('.')
}

/**
 * Decodes a JWT token, returning the individual parts
 * 
 * @param {string} token The JWT token string to decode
 * 
 * @returns {{header:Object,payload:Object,signature:string}} The decoded token
 */
exports.decode = function decode(token)
{
    if(typeof(token) != 'string')
        throw new Error('Token must be a string')

    const [ header, payload, signature ] = token.split('.').map(base64 => Buffer.from(base64, 'base64url').toString('utf8'))

    return { header: JSON.parse(header), payload: JSON.parse(payload), signature }
}

/**
 * Verifies a JWT token, given the secret it was encoded with
 * 
 * @param {string} token The JWT token to verify
 * @param {string} secret The secret to verify the token with
 * 
 * @returns {boolean} Whether the token was valid
 */
exports.validate = function validate(token, secret)
{
    if(typeof(token) != 'string')
        throw new Error('Token must be a string')

    const lastDelimiter = token.lastIndexOf('.')

    const headerAndPayload = token.slice(0, lastDelimiter)
    const theirSignature = token.slice(lastDelimiter+1)

    const ourSignature = crypto.createHmac('sha256', secret).update(headerAndPayload).digest('base64url')

    return theirSignature === ourSignature
}
