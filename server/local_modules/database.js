const sql = require("mysql")
const fs = require("fs")

////////////////////////////////////////
// Read database config and create a connection
////////////////////////////////////////

const connection = sql.createConnection(
    JSON.parse(
        fs.readFileSync(`${__dirname}/../config/database.json`).toString("utf8")
    )
)

connection.connect(err => {
    if(err) throw err
    console.log("Connected to the Database!")
})


////////////////////////////////////////
// Classes and datatypes
// (Opsætning af klasser og konstanter)
////////////////////////////////////////

const DataTypes = {
    INT:      0,
    TEXT:     1,
    BOOL:     2,
    DATETIME: 3,
    VARCHAR:  4,
}

class Column
{
    static FLAG_NULLABLE  = 0b00000001
    static FLAG_OMITTABLE = 0b00000010

    name     = null
    datatype = null
    flags    = null

    constructor(name, datatype, flags)
    {
        this.name     = name
        this.datatype = datatype
        this.flags    = flags
    }

    hasFlag(flag)
    {
        return (this.flags & flag) != 0
    }
}

class Table
{
    name = null
    columns = []

    constructor(name, columns)
    {
        this.name = name

        for(const column of columns)
        {
            this.columns[column.name] = column
        }
    }
}

class Filter
{
    static TYPE_VALUE_CLAUSE    = 0
    static TYPE_QUERY_CLAUSE    = 1
    static TYPE_CONSTANT_CLAUSE = 2

    column     = undefined
    template   = undefined
    clauseType = undefined
    value      = undefined

    static Factory(template, clauseType = null)
    {
        return (column, value) => new Filter(template, clauseType, column, value)
    }

    constructor(template, clauseType = null, column, value)
    {
        this.column     = column
        this.template   = template
        this.clauseType = clauseType ?? Filter.TYPE_VALUE_CLAUSE
        this.value      = value
    }

    getClause()
    {
        if(!this.column) return this.template

        return this.template.replace(/&COLUMN/gi, this.column.name)
    }

    getValues()
    {
        if(this.clauseType == Filter.TYPE_CONSTANT_CLAUSE) return []
        return [ this.value ]
    }

    getClauseType()
    {
        return this.clauseType
    }
}

////////////////////////////////////////
// Implementation
////////////////////////////////////////

let tables = {}
function addTable(table)
{
    tables[table.name] = table
}

const filters = {
    equals:        Filter.Factory("&COLUMN = ?"),
    greater:       Filter.Factory("&COLUMN > ?"),
    less:          Filter.Factory("&COLUMN < ?"),
    greaterequals: Filter.Factory("&COLUMN >= ?"),
    lessequals:    Filter.Factory("&COLUMN <= ?"),
    limit:         Filter.Factory("LIMIT ?", Filter.TYPE_QUERY_CLAUSE),
    skip:          Filter.Factory("SKIP ?",  Filter.TYPE_QUERY_CLAUSE),
    in:            Filter.Factory("&COLUMN IN (?)"),
    notin:         Filter.Factory("&COLUMN NOT IN (?)"),
    isnull:        Filter.Factory("&COLUMN IS NULL", Filter.TYPE_CONSTANT_CLAUSE),
}

/**
 * Assembles a list of filters into an SQL clause string and a list of parameters.
 * 
 * @param {Filter[]} filters The filters to be assembled into a clause string and its parameter values
 * 
 * @returns {{clauses: string, params: *[]}} The assembled clauses and parameters
 */
function assembleClauses(filters)
{
    if(!filters?.length) return { clauses: '', params: [] }

    let clauses = ''
    let params = []

    let valueClauses = []
    let queryClauses = []
    let valueClauseValues = []
    let queryClauseValues = []
    for(const filter of filters)
    {
        switch(filter.getClauseType())
        {
            case Filter.TYPE_VALUE_CLAUSE:
                valueClauses.push(filter.getClause())
                valueClauseValues.push(...filter.getValues())
                break
            
            case Filter.TYPE_QUERY_CLAUSE:
                queryClauses.push(filter.getClause())
                queryClauseValues.push(...filter.getValues())
                break
            
            case Filter.TYPE_CONSTANT_CLAUSE:
                valueClauses.push(filter.getClause())
                break

            default:
                throw new Error(`Unknown clause type: '${filter.getClauseType()}'`)
        }
    }

    if(valueClauses.length)
    {
        params.push(...valueClauseValues)
        clauses += ` WHERE ((${valueClauses.join(') AND (')}))`
    }

    if(queryClauses.length)
    {
        params.push(...queryClauseValues)
        clauses += ` ${queryClauses.join(' ')}`
    }

    return { clauses, params }
}


/**
 * Runs a SELECT query on the database.
 * 
 * @param {Table}    table   The table to select data from
 * @param {Filter[]} filters [OPTIONAL] The filters to include when running the query
 * 
 * @returns {Promise<Object[]>} A promise that resolves to an array of rows that were returned by the query
 */
function SelectQuery(table, filters = null)
{
    const { clauses, params } = assembleClauses(filters)
    const query = `SELECT * FROM ${table.name}${clauses}`

    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, res) => {
            if(err) return void reject(`Select Query failed: ${err}, [${query}], [${params.map(p=>p?.toString?.()??'null').join()}]`)
            resolve(res)
        })
    })
}

function InsertQuery(table, data)
{
    let params = []
    let columns = []

    for(const [name, column] of Object.entries(table.columns))
    {
        if(data[name] === undefined && !column.hasFlag(Column.FLAG_OMITTABLE))
        {
            return Promise.reject(`Insert Query failed: The column "${name}" is not omittable,`)
        }

        if(data[name] === null && !column.hasFlag(Column.FLAG_NULLABLE))
        {
            return Promise.reject(`Insert Query failed: The column "${name}" is not nullable`)
        }

        columns.push(name)
        params.push(data[name])
    }

    const query = `INSERT INTO ${table.name} (${columns.join(',')}) VALUES (${',?'.repeat(params.length).substring(1)})`

    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, res) => {
            if(err) return void reject(`Insert Query failed: ${err}, [${query}], [${params.map(p=>p?.toString?.()??'null').join()}]`)
            resolve(res)
        })
    })
}

/**
 * Runs a DELETE query on the database.
 * 
 * @param {Table}    table   The table to delete data from
 * @param {Filter[]} filters [OPTIONAL] The filters to include when running the query
 * 
 * @returns {Promise<Object[]>} A promise that resolves on success and rejects on failure
 */
function DeleteQuery(table, filters)
{
    const { clauses, params } = assembleClauses(filters)
    const query = `DELETE FROM ${table.name}${clauses}`

    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, res) => {
            if(err) return void reject(`Delete Query Failed: ${err}, [${query}], [${params.map(p=>p?.toString?.()??'null').join()}]`)
            resolve(res)
        })
    })
}

function UpdateQuery(table, data, filters)
{
    const { clauses, params: clauseParams } = assembleClauses(filters)

    let params = []
    let columns = []
    for(const [name, column] of Object.entries(table.columns))
    {
        if(data[name] === undefined)
        {
            continue
        }

        if(data[name] === null && !column.hasFlag(Column.FLAG_NULLABLE))
        {
            return Promise.reject(`Update Query failed: The column "${name}" is not nullable`)
        }

        columns.push(name)
        params.push(data[name])
    }

    if(columns.length <= 0)
    {
        return Promise.reject(`Update Query failed: No columns given`)
    }

    const query = `UPDATE ${table.name} SET ${columns.map(column => `${column} = ?`).join(',')}${clauses}`

    params = params.concat(clauseParams)

    return new Promise((resolve, reject) => {
        // resolve(`QUERY[${query}] PARAMS[${params.map(p=>p?.toString?.() ?? 'null').join(',')}]`)
        connection.query(query, params, (err, res) => {
            if(err) return void reject(`Update Query failed: ${err}, [${query}], [${params.map(p=>p?.toString?.()??'null').join()}]`)
            resolve(res)
        })
    })
}

////////////////////////////////////////
// Actual configuration
////////////////////////////////////////


// Tables:
addTable(new Table("UserAccount", [
    new Column("ID",           DataTypes.INT, Column.FLAG_OMITTABLE),
    new Column("Name",         DataTypes.VARCHAR),
    new Column("Password",     DataTypes.VARCHAR),
    new Column("CreationDate", DataTypes.DATETIME, Column.FLAG_OMITTABLE),
]))

addTable(new Table("Friends", [
    new Column("ID",          DataTypes.INT, Column.FLAG_OMITTABLE),
    new Column("UserID1",     DataTypes.INT),
    new Column("UserID2",     DataTypes.INT),
    new Column("BlockedByID", DataTypes.INT, Column.FLAG_OMITTABLE),
]))

addTable(new Table("FriendRequests", [
    new Column("ID",           DataTypes.INT, Column.FLAG_OMITTABLE),
    new Column("FromUserID",   DataTypes.INT),
    new Column("ToUserID",     DataTypes.INT),
    new Column("CreationDate", DataTypes.DATETIME, Column.FLAG_OMITTABLE),
]))

addTable(new Table("Messages", [
    new Column("ID",       DataTypes.INT, Column.FLAG_OMITTABLE),
    new Column("UserID",   DataTypes.INT),
    new Column("Message",  DataTypes.TEXT),
    new Column("TimeSent", DataTypes.DATETIME, Column.FLAG_OMITTABLE),
    new Column("Channel",  DataTypes.INT, Column.FLAG_NULLABLE),
]))


////////////////////////////////////////
// Node Exports
////////////////////////////////////////

// The table list
exports.tables = tables

// The filter list
exports.filters = filters

// The queries
exports.select = SelectQuery
exports.insert = InsertQuery
exports.update = UpdateQuery
exports.delete = DeleteQuery