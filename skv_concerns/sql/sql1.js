

mssql

Microsoft SQL Server client for Node.js

NPM Version NPM Downloads Package Quality Travis CI Appveyor CI Join the chat at https://gitter.im/patriksimek/node-mssql

v4 upgrade warning - Version 4 contains many breaking changes, read more in the 3.x to 4.x changes section. Version 3 docs are available here.

Supported TDS drivers:

    Tedious (pure JavaScript - Windows/macOS/Linux, default)
    Microsoft / Contributors Node V8 Driver for Node.js for SQL Server (native - Windows only)

Installation

IMPORTANT: Requires Node.js 4 or newer.

npm install mssql

Quick Example

const sql = require('mssql')
 
async () => {
    try {
        const pool = await sql.connect('mssql://username:password@localhost/database')
        const result = await sql.query`select * from mytable where id = ${value}`
        console.dir(result)
    } catch (err) {
        // ... error checks 
    }
}

If you're on Windows Azure, add ?encrypt=true to your connection string. See docs to learn more.
Documentation

    3.x to 4.x changes

Examples

    Async/Await
    Promises
    ES6 Tagged template literals
    Callbacks
    Streaming
    Connection Pools

Configuration

    General
    Formats

Drivers

    Tedious
    Microsoft / Contributors Node V8 Driver for Node.js for SQL Server

Connections

    ConnectionPool
    connect
    close

Requests

    Request
    execute
    input
    output
    pipe
    query
    batch
    bulk
    cancel

Transactions

    Transaction
    begin
    commit
    rollback

Prepared Statements

    PreparedStatement
    input
    output
    prepare
    execute
    unprepare

Other

    CLI
    Geography and Geometry
    Table-Valued Parameter
    Affected Rows
    JSON support
    Errors
    Informational messages
    Metadata
    Data Types
    SQL injection
    Known Issues
    Contributing

Examples
Config

const config = {
    user: '...',
    password: '...',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance 
    database: '...',
 
    options: {
        encrypt: true // Use this if you're on Windows Azure 
    }
}

Async/Await

const sql = require('mssql')
 
(async function () {
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request()
            .input('input_parameter', sql.Int, value)
            .query('select * from mytable where id = @input_parameter')
            
        console.dir(result1)
    
        // Stored procedure 
        
        let result2 = await pool.request()
            .input('input_parameter', sql.Int, value)
            .output('output_parameter', sql.VarChar(50))
            .execute('procedure_name')
        
        console.dir(result2)
    } catch (err) {
        // ... error checks 
    }
})()
 
sql.on('error', err => {
    // ... error handler 
})

Promises

const sql = require('mssql')
 
sql.connect(config).then(pool => {
    // Query 
    
    return pool.request()
    .input('input_parameter', sql.Int, value)
    .query('select * from mytable where id = @input_parameter')
}).then(result => {
    console.dir(result)
    
    // Stored procedure 
    
    return pool.request()
    .input('input_parameter', sql.Int, value)
    .output('output_parameter', sql.VarChar(50))
    .execute('procedure_name')
}).then(result => {
    console.dir(result)
}).catch(err => {
    // ... error checks 
})
 
sql.on('error', err => {
    // ... error handler 
})

Native Promise is used by default. You can easily change this with sql.Promise = require('myownpromisepackage').

ES6 Tagged template literals

const sql = require('mssql')
 
sql.connect(config).then(() => {
    return sql.query`select * from mytable where id = ${value}`
}).then(result => {
    console.dir(result)
}).catch(err => {
    // ... error checks 
})
 
sql.on('error', err => {
    // ... error handler 
})

All values are automatically sanitized against sql injection.
Callbacks

const sql = require('mssql')
 
sql.connect(config, err => {
    // ... error checks 
 
    // Query 
 
    new sql.Request().query('select 1 as number', (err, result) => {
        // ... error checks 
 
        console.dir(result)
    })
 
    // Stored Procedure 
 
    new sql.Request()
    .input('input_parameter', sql.Int, value)
    .output('output_parameter', sql.VarChar(50))
    .execute('procedure_name', (err, result) => {
        // ... error checks 
 
        console.dir(result)
    })
})
 
sql.on('error', err => {
    // ... error handler 
})

Streaming

If you plan to work with large amount of rows, you should always use streaming. Once you enable this, you must listen for events to receive data.

const sql = require('mssql')
 
sql.connect(config, err => {
    // ... error checks 
 
    const request = new sql.Request()
    request.stream = true // You can set streaming differently for each request 
    request.query('select * from verylargetable') // or request.execute(procedure) 
 
    request.on('recordset', columns => {
        // Emitted once for each recordset in a query 
    })
 
    request.on('row', row => {
        // Emitted for each row in a recordset 
    })
 
    request.on('error', err => {
        // May be emitted multiple times 
    })
 
    request.on('done', result => {
        // Always emitted as the last one 
    })
})
 
sql.on('error', err => {
    // ... error handler 
})

Connection Pools

const sql = require('mssql')
 
const pool1 = new sql.ConnectionPool(config, err => {
    // ... error checks 
 
    // Query 
 
    pool1.request() // or: new sql.Request(pool1) 
    .query('select 1 as number', (err, result) => {
        // ... error checks 
 
        console.dir(result)
    })
 
})
 
pool1.on('error', err => {
    // ... error handler 
})
 
const pool2 = new sql.ConnectionPool(config, err => {
    // ... error checks 
 
    // Stored Procedure 
 
    pool2.request() // or: new sql.Request(pool2) 
    .input('input_parameter', sql.Int, 10)
    .output('output_parameter', sql.VarChar(50))
    .execute('procedure_name', (err, result) => {
        // ... error checks 
 
        console.dir(result)
    })
})
 
pool1.on('error', err => {
    // ... error handler 
})

ES6 Tagged template literals

new sql.ConnectionPool(config).connect().then(pool => {
    return pool.query`select * from mytable where id = ${value}`
}).then(result => {
    console.dir(result)
}).catch(err => {
    // ... error checks 
})

All values are automatically sanitized against sql injection.
Configuration

const config = {
    user: '...',
    password: '...',
    server: 'localhost',
    database: '...',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

General (same for all drivers)

    user - User name to use for authentication.
    password - Password to use for authentication.
    server - Server to connect to. You can use 'localhost\instance' to connect to named instance.
    port - Port to connect to (default: 1433). Don't set when connecting to named instance.
    domain - Once you set domain, driver will connect to SQL Server using domain login.
    database - Database to connect to (default: dependent on server configuration).
    connectionTimeout - Connection timeout in ms (default: 15000).
    requestTimeout - Request timeout in ms (default: 15000).
    stream - Stream recordsets/rows instead of returning them all at once as an argument of callback (default: false). You can also enable streaming for each request independently (request.stream = true). Always set to true if you plan to work with large amount of rows.
    parseJSON - Parse JSON recordsets to JS objects (default: false). For more information please see section JSON support.
    pool.max - The maximum number of connections there can be in the pool (default: 10).
    pool.min - The minimum of connections there can be in the pool (default: 0).
    pool.idleTimeoutMillis - The Number of milliseconds before closing an unused connection (default: 30000).

Complete list of pool options can be found here.
Formats

In addition to configuration object there is an option to pass config as a connection string. Two formats of connection string are supported.
Classic Connection String

Server=localhost,1433;Database=database;User Id=username;Password=password;Encrypt=true
Driver=msnodesqlv8;Server=(local)\INSTANCE;Database=database;UID=DOMAIN\username;PWD=password;Encrypt=true

Connection String URI

mssql://username:password@localhost:1433/database?encrypt=true
mssql://username:password@localhost/INSTANCE/database?encrypt=true&domain=DOMAIN&driver=msnodesqlv8

Version

2.5
Drivers
Tedious

Default driver, actively maintained and production ready. Platform independent, runs everywhere Node.js runs. Officially supported by Microsoft.

Extra options:

    options.instanceName - The instance name to connect to. The SQL Server Browser service must be running on the database server, and UDP port 1444 on the database server must be reachable.
    options.useUTC - A boolean determining whether or not use UTC time for values without time zone offset (default: true).
    options.encrypt - A boolean determining whether or not the connection will be encrypted (default: false).
    options.tdsVersion - The version of TDS to use (default: 7_4, available: 7_1, 7_2, 7_3_A, 7_3_B, 7_4).
    options.appName - Application name used for SQL server logging.
    options.abortTransactionOnError - A boolean determining whether to rollback a transaction automatically if any error is encountered during the given transaction's execution. This sets the value for XACT_ABORT during the initial SQL phase of a connection.

More information about Tedious specific options: http://tediousjs.github.io/tedious/api-connection.html
Microsoft / Contributors Node V8 Driver for Node.js for SQL Server

Requires Node.js 0.12.x or newer. Windows only. This driver is not part of the default package and must be installed separately by npm install msnodesqlv8. To use this driver, use this require syntax: const sql = require('mssql/msnodesqlv8').

Extra options:

    connectionString - Connection string (default: see below).
    options.instanceName - The instance name to connect to. The SQL Server Browser service must be running on the database server, and UDP port 1444 on the database server must be reachable.
    options.trustedConnection - Use Windows Authentication (default: false).
    options.useUTC - A boolean determining whether or not to use UTC time for values without time zone offset (default: true).

Default connection string when connecting to port:

Driver={SQL Server Native Client 11.0};Server={#{server},#{port}};Database={#{database}};Uid={#{user}};Pwd={#{password}};Trusted_Connection={#{trusted}};

Default connection string when connecting to named instance:

Driver={SQL Server Native Client 11.0};Server={#{server}\\#{instance}};Database={#{database}};Uid={#{user}};Pwd={#{password}};Trusted_Connection={#{trusted}};

Connections

Internally, each ConnectionPool instance is a separate pool of TDS connections. Once you create a new Request/Transaction/Prepared Statement, a new TDS connection is acquired from the pool and reserved for desired action. Once the action is complete, connection is released back to the pool. Connection health check is built-in so once the dead connection is discovered, it is immediately replaced with a new one.

IMPORTANT: Always attach an error listener to created connection. Whenever something goes wrong with the connection it will emit an error and if there is no listener it will crash your application with an uncaught error.

const pool = new sql.ConnectionPool({ /* config */ })

Events

    error(err) - Dispatched on connection error.

connect ([callback])

Create a new connection pool. The initial probe connection is created to find out whether the configuration is valid.

Arguments

    callback(err) - A callback which is called after initial probe connection has established, or an error has occurred. Optional. If omitted, returns Promise.

Example

const pool = new sql.ConnectionPool({
    user: '...',
    password: '...',
    server: 'localhost',
    database: '...'
})
 
pool.connect(err => {
    // ... 
})

Errors

    ELOGIN (ConnectionError) - Login failed.
    ETIMEOUT (ConnectionError) - Connection timeout.
    EALREADYCONNECTED (ConnectionError) - Database is already connected!
    EALREADYCONNECTING (ConnectionError) - Already connecting to database!
    EINSTLOOKUP (ConnectionError) - Instance lookup failed.
    ESOCKET (ConnectionError) - Socket error.

close()

Close all active connections in the pool.

Example

pool.close()

Request

const request = new sql.Request(/* [pool or transaction] */)

If you omit pool/transaction argument, global pool is used instead.
Events

    recordset(columns) - Dispatched when metadata for new recordset are parsed.
    row(row) - Dispatched when new row is parsed.
    done(returnValue) - Dispatched when request is complete.
    error(err) - Dispatched on error.
    info(message) - Dispatched on informational message.

execute (procedure, [callback])

Call a stored procedure.

Arguments

    procedure - Name of the stored procedure to be executed.
    callback(err, recordsets, returnValue) - A callback which is called after execution has completed, or an error has occurred. returnValue is also accessible as property of recordsets. Optional. If omitted, returns Promise.

Example

const request = new sql.Request()
request.input('input_parameter', sql.Int, value)
request.output('output_parameter', sql.Int)
request.execute('procedure_name', (err, result) => {
    // ... error checks 
 
    console.log(result.recordsets.length) // count of recordsets returned by the procedure 
    console.log(result.recordsets[0].length) // count of rows contained in first recordset 
    console.log(result.recordset) // first recordset from result.recordsets 
    console.log(result.returnValue) // procedure return value 
    console.log(result.output) // key/value collection of output values 
    console.log(result.rowsAffected) // array of numbers, each number represents the number of rows affected by executed statemens 
 
    // ... 
})

Errors

    EREQUEST (RequestError) - Message from SQL Server
    ECANCEL (RequestError) - Cancelled.
    ETIMEOUT (RequestError) - Request timeout.
    ENOCONN (RequestError) - No connection is specified for that request.
    ENOTOPEN (ConnectionError) - Connection not yet open.
    ECONNCLOSED (ConnectionError) - Connection is closed.
    ENOTBEGUN (TransactionError) - Transaction has not begun.
    EABORT (TransactionError) - Transaction was aborted (by user or because of an error).

input (name, [type], value)

Add an input parameter to the request.

Arguments

    name - Name of the input parameter without @ char.
    type - SQL data type of input parameter. If you omit type, module automatically decide which SQL data type should be used based on JS data type.
    value - Input parameter value. undefined ans NaN values are automatically converted to null values.

Example

request.input('input_parameter', value)
request.input('input_parameter', sql.Int, value)

JS Data Type To SQL Data Type Map

    String -> sql.NVarChar
    Number -> sql.Int
    Boolean -> sql.Bit
    Date -> sql.DateTime
    Buffer -> sql.VarBinary
    sql.Table -> sql.TVP

Default data type for unknown object is sql.NVarChar.

You can define your own type map.

sql.map.register(MyClass, sql.Text)

You can also overwrite the default type map.

sql.map.register(Number, sql.BigInt)

Errors (synchronous)

    EARGS (RequestError) - Invalid number of arguments.
    EINJECT (RequestError) - SQL injection warning.

output (name, type, [value])

Add an output parameter to the request.

Arguments

    name - Name of the output parameter without @ char.
    type - SQL data type of output parameter.
    value - Output parameter value initial value. undefined and NaN values are automatically converted to null values. Optional.

Example

request.output('output_parameter', sql.Int)
request.output('output_parameter', sql.VarChar(50), 'abc')

Errors (synchronous)

    EARGS (RequestError) - Invalid number of arguments.
    EINJECT (RequestError) - SQL injection warning.

pipe (stream)

Sets request to stream mode and pulls all rows from all recordsets to a given stream.

Arguments

    stream - Writable stream in object mode.

Example

const request = new sql.Request()
request.pipe(stream)
request.query('select * from mytable')
stream.on('error', err => {
    // ... 
})
stream.on('finish', () => {
    // ... 
})

Version

2.0
query (command, [callback])

Execute the SQL command. To execute commands like create procedure or if you plan to work with local temporary tables, use batch instead.

Arguments

    command - T-SQL command to be executed.
    callback(err, recordset) - A callback which is called after execution has completed, or an error has occurred. Optional. If omitted, returns Promise.

Example

const request = new sql.Request()
request.query('select 1 as number', (err, result) => {
    // ... error checks 
 
    console.log(result.recordset[0].number) // return 1 
 
    // ... 
})

Errors

    ETIMEOUT (RequestError) - Request timeout.
    EREQUEST (RequestError) - Message from SQL Server
    ECANCEL (RequestError) - Cancelled.
    ENOCONN (RequestError) - No connection is specified for that request.
    ENOTOPEN (ConnectionError) - Connection not yet open.
    ECONNCLOSED (ConnectionError) - Connection is closed.
    ENOTBEGUN (TransactionError) - Transaction has not begun.
    EABORT (TransactionError) - Transaction was aborted (by user or because of an error).

const request = new sql.Request()
request.multiple = true
 
request.query('select 1 as number; select 2 as number', (err, result) => {
    // ... error checks 
 
    console.log(result.recordset[0].number) // return 1 
    console.log(result.recordsets[0][0].number) // return 1 
    console.log(result.recordsets[1][0].number) // return 2 
})

NOTE: To get number of rows affected by the statement(s), see section Affected Rows.
batch (batch, [callback])

Execute the SQL command. Unlike query, it doesn't use sp_executesql, so is not likely that SQL Server will reuse the execution plan it generates for the SQL. Use this only in special cases, for example when you need to execute commands like create procedure which can't be executed with query or if you're executing statements longer than 4000 chars on SQL Server 2000. Also you should use this if you're plan to work with local temporary tables (more information here).

NOTE: Table-Valued Parameter (TVP) is not supported in batch.

Arguments

    batch - T-SQL command to be executed.
    callback(err, recordset) - A callback which is called after execution has completed, or an error has occurred. Optional. If omitted, returns Promise.

Example

const request = new sql.Request()
request.batch('create procedure #temporary as select * from table', (err, result) => {
    // ... error checks 
})

Errors

    ETIMEOUT (RequestError) - Request timeout.
    EREQUEST (RequestError) - Message from SQL Server
    ECANCEL (RequestError) - Cancelled.
    ENOCONN (RequestError) - No connection is specified for that request.
    ENOTOPEN (ConnectionError) - Connection not yet open.
    ECONNCLOSED (ConnectionError) - Connection is closed.
    ENOTBEGUN (TransactionError) - Transaction has not begun.
    EABORT (TransactionError) - Transaction was aborted (by user or because of an error).

You can enable multiple recordsets in queries with the request.multiple = true command.
bulk(table, [callback])

Perform a bulk insert.

Arguments

    table - sql.Table instance.
    callback(err, rowCount) - A callback which is called after bulk insert has completed, or an error has occurred. Optional. If omitted, returns Promise.

Example

const table = new sql.Table('table_name') // or temporary table, e.g. #temptable 
table.create = true
table.columns.add('a', sql.Int, {nullable: true, primary: true})
table.columns.add('b', sql.VarChar(50), {nullable: false})
table.rows.add(777, 'test')
 
const request = new sql.Request()
request.bulk(table, (err, result) => {
    // ... error checks 
})

IMPORTANT: Always indicate whether the column is nullable or not!

TIP: If you set table.create to true, module will check if the table exists before it start sending data. If it doesn't, it will automatically create it. You can specify primary key columns by setting primary: true to column's options. Primary key constraint on multiple columns is supported.

TIP: You can also create Table variable from any recordset with recordset.toTable().

Errors

    ENAME (RequestError) - Table name must be specified for bulk insert.
    ETIMEOUT (RequestError) - Request timeout.
    EREQUEST (RequestError) - Message from SQL Server
    ECANCEL (RequestError) - Cancelled.
    ENOCONN (RequestError) - No connection is specified for that request.
    ENOTOPEN (ConnectionError) - Connection not yet open.
    ECONNCLOSED (ConnectionError) - Connection is closed.
    ENOTBEGUN (TransactionError) - Transaction has not begun.
    EABORT (TransactionError) - Transaction was aborted (by user or because of an error).

cancel()

Cancel currently executing request. Return true if cancellation packet was send successfully.

Example

const request = new sql.Request()
request.query('waitfor delay \'00:00:05\'; select 1 as number', (err, result) => {
    console.log(err instanceof sql.RequestError)  // true 
    console.log(err.message)                      // Cancelled. 
    console.log(err.code)                         // ECANCEL 
 
    // ... 
})
 
request.cancel()

Transaction

IMPORTANT: always use Transaction class to create transactions - it ensures that all your requests are executed on one connection. Once you call begin, a single connection is acquired from the connection pool and all subsequent requests (initialized with the Transaction object) are executed exclusively on this connection. After you call commit or rollback, connection is then released back to the connection pool.

const transaction = new sql.Transaction(/* [pool] */)

If you omit connection argument, global connection is used instead.

Example

const transaction = new sql.Transaction(/* [pool] */)
transaction.begin(err => {
    // ... error checks 
 
    const request = new sql.Request(transaction)
    request.query('insert into mytable (mycolumn) values (12345)', (err, result) => {
        // ... error checks 
 
        transaction.commit(err => {
            // ... error checks 
 
            console.log("Transaction committed.")
        })
    })
})

Transaction can also be created by const transaction = pool.transaction(). Requests can also be created by const request = transaction.request().

Aborted transactions

This example shows how you should correctly handle transaction errors when abortTransactionOnError (XACT_ABORT) is enabled. Added in 2.0.

const transaction = new sql.Transaction(/* [pool] */)
transaction.begin(err => {
    // ... error checks 
 
    let rolledBack = false
 
    transaction.on('rollback', aborted => {
        // emited with aborted === true 
 
        rolledBack = true
    })
 
    new sql.Request(transaction)
    .query('insert into mytable (bitcolumn) values (2)', (err, result) => {
        // insert should fail because of invalid value 
 
        if (err) {
            if (!rolledBack) {
                transaction.rollback(err => {
                    // ... error checks 
                })
            }
        } else {
            transaction.commit(err => {
                // ... error checks 
            })
        }
    })
})

Events

    begin - Dispatched when transaction begin.
    commit - Dispatched on successful commit.
    rollback(aborted) - Dispatched on successful rollback with an argument determining if the transaction was aborted (by user or because of an error).

begin ([isolationLevel], [callback])

Begin a transaction.

Arguments

    isolationLevel - Controls the locking and row versioning behavior of TSQL statements issued by a connection. Optional. READ_COMMITTED by default. For possible values see sql.ISOLATION_LEVEL.
    callback(err) - A callback which is called after transaction has began, or an error has occurred. Optional. If omitted, returns Promise.

Example

const transaction = new sql.Transaction()
transaction.begin(err => {
    // ... error checks 
})

Errors

    ENOTOPEN (ConnectionError) - Connection not yet open.
    EALREADYBEGUN (TransactionError) - Transaction has already begun.

commit ([callback])

Commit a transaction.

Arguments

    callback(err) - A callback which is called after transaction has committed, or an error has occurred. Optional. If omitted, returns Promise.

Example

const transaction = new sql.Transaction()
transaction.begin(err => {
    // ... error checks 
 
    transaction.commit(err => {
        // ... error checks 
    })
})

Errors

    ENOTBEGUN (TransactionError) - Transaction has not begun.
    EREQINPROG (TransactionError) - Can't commit transaction. There is a request in progress.

rollback ([callback])

Rollback a transaction. If the queue isn't empty, all queued requests will be Cancelled and the transaction will be marked as aborted.

Arguments

    callback(err) - A callback which is called after transaction has rolled back, or an error has occurred. Optional. If omitted, returns Promise.

Example

const transaction = new sql.Transaction()
transaction.begin(err => {
    // ... error checks 
 
    transaction.rollback(err => {
        // ... error checks 
    })
})

Errors

    ENOTBEGUN (TransactionError) - Transaction has not begun.
    EREQINPROG (TransactionError) - Can't rollback transaction. There is a request in progress.

Prepared Statement

IMPORTANT: always use PreparedStatement class to create prepared statements - it ensures that all your executions of prepared statement are executed on one connection. Once you call prepare, a single connection is acquired from the connection pool and all subsequent executions are executed exclusively on this connection. After you call unprepare, the connection is then released back to the connection pool.

const ps = new sql.PreparedStatement(/* [pool] */)

If you omit the connection argument, the global connection is used instead.

Example

const ps = new sql.PreparedStatement(/* [pool] */)
ps.input('param', sql.Int)
ps.prepare('select @param as value', err => {
    // ... error checks 
 
    ps.execute({param: 12345}, (err, result) => {
        // ... error checks 
 
        ps.unprepare(err => {
            // ... error checks 
 
        })
    })
})

IMPORTANT: Remember that each prepared statement means one reserved connection from the pool. Don't forget to unprepare a prepared statement!

TIP: You can also create prepared statements in transactions (new sql.PreparedStatement(transaction)), but keep in mind you can't execute other requests in the transaction until you call unprepare.
input (name, type)

Add an input parameter to the prepared statement.

Arguments

    name - Name of the input parameter without @ char.
    type - SQL data type of input parameter.

Example

ps.input('input_parameter', sql.Int)
ps.input('input_parameter', sql.VarChar(50))

Errors (synchronous)

    EARGS (PreparedStatementError) - Invalid number of arguments.
    EINJECT (PreparedStatementError) - SQL injection warning.

output (name, type)

Add an output parameter to the prepared statement.

Arguments

    name - Name of the output parameter without @ char.
    type - SQL data type of output parameter.

Example

ps.output('output_parameter', sql.Int)
ps.output('output_parameter', sql.VarChar(50))

Errors (synchronous)

    EARGS (PreparedStatementError) - Invalid number of arguments.
    EINJECT (PreparedStatementError) - SQL injection warning.

prepare (statement, [callback])

Prepare a statement.

Arguments

    statement - T-SQL statement to prepare.
    callback(err) - A callback which is called after preparation has completed, or an error has occurred. Optional. If omitted, returns Promise.

Example

const ps = new sql.PreparedStatement()
ps.prepare('select @param as value', err => {
    // ... error checks 
})

Errors

    ENOTOPEN (ConnectionError) - Connection not yet open.
    EALREADYPREPARED (PreparedStatementError) - Statement is already prepared.
    ENOTBEGUN (TransactionError) - Transaction has not begun.

execute (values, [callback])

Execute a prepared statement.

Arguments

    values - An object whose names correspond to the names of parameters that were added to the prepared statement before it was prepared.
    callback(err) - A callback which is called after execution has completed, or an error has occurred. Optional. If omitted, returns Promise.

Example

const ps = new sql.PreparedStatement()
ps.input('param', sql.Int)
ps.prepare('select @param as value', err => {
    // ... error checks 
 
    ps.execute({param: 12345}, (err, result) => {
        // ... error checks 
 
        console.log(result.recordset[0].value) // return 12345 
        console.log(result.rowsAffected) // Returns number of affected rows in case of INSERT, UPDATE or DELETE statement. 
        
        ps.unprepare(err => {
            // ... error checks 
        })
    })
})

You can also stream executed request.

const ps = new sql.PreparedStatement()
ps.input('param', sql.Int)
ps.prepare('select @param as value', err => {
    // ... error checks 
 
    ps.stream = true
    const request = ps.execute({param: 12345})
 
    request.on('recordset', columns => {
        // Emitted once for each recordset in a query 
    })
 
    request.on('row', row => {
        // Emitted for each row in a recordset 
    })
 
    request.on('error', err => {
        // May be emitted multiple times 
    })
 
    request.on('done', result => {
        // Always emitted as the last one 
        
        console.log(result.rowsAffected) // Returns number of affected rows in case of INSERT, UPDATE or DELETE statement. 
        
        ps.unprepare(err => {
            // ... error checks 
        })
    })
})

TIP: To learn more about how number of affected rows works, see section Affected Rows.

Errors

    ENOTPREPARED (PreparedStatementError) - Statement is not prepared.
    ETIMEOUT (RequestError) - Request timeout.
    EREQUEST (RequestError) - Message from SQL Server
    ECANCEL (RequestError) - Cancelled.

unprepare ([callback])

Unprepare a prepared statement.

Arguments

    callback(err) - A callback which is called after unpreparation has completed, or an error has occurred. Optional. If omitted, returns Promise.

Example

const ps = new sql.PreparedStatement()
ps.input('param', sql.Int)
ps.prepare('select @param as value', err => {
    // ... error checks 
 
    ps.unprepare(err => {
        // ... error checks 
 
    })
})

Errors

    ENOTPREPARED (PreparedStatementError) - Statement is not prepared.

CLI

Before you can start using CLI, you must install mssql globally with npm install mssql -g. Once you do that you will be able to execute mssql command.

Setup

Create a .mssql.json configuration file (anywhere). Structure of the file is the same as the standard configuration object.

{
    "user": "...",
    "password": "...",
    "server": "localhost",
    "database": "..."
}

Example

echo "select * from mytable" | mssql /path/to/config

Results in:

[[{"username":"patriksimek","password":"tooeasy"}]]

You can also query for multiple recordsets.

echo "select * from mytable; select * from myothertable" | mssql

Results in:

[[{"username":"patriksimek","password":"tooeasy"}],[{"id":15,"name":"Product name"}]]

If you omit config path argument, mssql will try to load it from current working directory.

Version

2.0
Geography and Geometry

node-mssql has built-in serializer for Geography and Geometry CLR data types.

select geography::STGeomFromText('LINESTRING(-122.360 47.656, -122.343 47.656 )', 4326)
select geometry::STGeomFromText('LINESTRING (100 100 10.3 12, 20 180, 180 180)', 0)

Results in:

{ srid: 4326,
  version: 1,
  points: [ { x: 47.656, y: -122.36 }, { x: 47.656, y: -122.343 } ],
  figures: [ { attribute: 1, pointOffset: 0 } ],
  shapes: [ { parentOffset: -1, figureOffset: 0, type: 2 } ],
  segments: [] }
 
{ srid: 0,
  version: 1,
  points:
   [ { x: 100, y: 100, z: 10.3, m: 12 },
     { x: 20, y: 180, z: NaN, m: NaN },
     { x: 180, y: 180, z: NaN, m: NaN } ],
  figures: [ { attribute: 1, pointOffset: 0 } ],
  shapes: [ { parentOffset: -1, figureOffset: 0, type: 2 } ],
  segments: [] }

Table-Valued Parameter (TVP)

Supported on SQL Server 2008 and later. You can pass a data table as a parameter to stored procedure. First, we have to create custom type in our database.

CREATE TYPE TestType AS TABLE ( a VARCHAR(50), b INT );

Next we will need a stored procedure.

CREATE PROCEDURE MyCustomStoredProcedure (@tvp TestType readonly) AS SELECT * FROM @tvp

Now let's go back to our Node.js app.

const tvp = new sql.Table()
 
// Columns must correspond with type we have created in database. 
tvp.columns.add('a', sql.VarChar(50))
tvp.columns.add('b', sql.Int)
 
// Add rows 
tvp.rows.add('hello tvp', 777) // Values are in same order as columns. 

You can send table as a parameter to stored procedure.

const request = new sql.Request()
request.input('tvp', tvp)
request.execute('MyCustomStoredProcedure', (err, result) => {
    // ... error checks 
 
    console.dir(result.recordsets[0][0]) // {a: 'hello tvp', b: 777} 
})

TIP: You can also create Table variable from any recordset with recordset.toTable().
Affected Rows

If you're performing INSERT, UPDATE or DELETE in a query, you can read number of affected rows. The rowsAffected variable is an array of numbers. Each number represents number of affected rows by a single statement.

Example using Promises

const request = new sql.Request()
request.query('update myAwesomeTable set awesomness = 100').then(result => {
    console.log(result.rowsAffected)
})

Example using callbacks

const request = new sql.Request()
request.query('update myAwesomeTable set awesomness = 100', (err, result) => {
    console.log(result.rowsAffected)
})

Example using streaming

const request = new sql.Request()
request.stream = true
request.query('update myAwesomeTable set awesomness = 100')
request.on('done', result => {
    console.log(result.rowsAffected)
})

Version

3.0
JSON support

SQL Server 2016 introduced built-in JSON serialization. By default, JSON is returned as a plain text in a special column named JSON_F52E2B61-18A1-11d1-B105-00805F49916B.

Example

SELECT
    1 AS 'a.b.c',
    2 AS 'a.b.d',
    3 AS 'a.x',
    4 AS 'a.y'
FOR JSON PATH

Results in:

recordset = [ { 'JSON_F52E2B61-18A1-11d1-B105-00805F49916B': '{"a":{"b":{"c":1,"d":2},"x":3,"y":4}}' } ]

You can enable built-in JSON parser with config.parseJSON = true. Once you enable this, recordset will contain rows of parsed JS objects. Given the same example, result will look like this:

recordset = [ { a: { b: { c: 1, d: 2 }, x: 3, y: 4 } } ]

IMPORTANT: In order for this to work, there must be exactly one column named JSON_F52E2B61-18A1-11d1-B105-00805F49916B in the recordset.

More information about JSON support can be found in official documentation.

Version

2.3
Errors

There are 4 types of errors you can handle:

    ConnectionError - Errors related to connections and connection pool.
    TransactionError - Errors related to creating, committing and rolling back transactions.
    RequestError - Errors related to queries and stored procedures execution.
    PreparedStatementError - Errors related to prepared statements.

Those errors are initialized in node-mssql module and its original stack may be cropped. You can always access original error with err.originalError.

SQL Server may generate more than one error for one request so you can access preceding errors with err.precedingErrors.
Error Codes

Each known error has name, code and message properties.
Name 	Code 	Message
ConnectionError 	ELOGIN 	Login failed.
ConnectionError 	ETIMEOUT 	Connection timeout.
ConnectionError 	EDRIVER 	Unknown driver.
ConnectionError 	EALREADYCONNECTED 	Database is already connected!
ConnectionError 	EALREADYCONNECTING 	Already connecting to database!
ConnectionError 	ENOTOPEN 	Connection not yet open.
ConnectionError 	EINSTLOOKUP 	Instance lookup failed.
ConnectionError 	ESOCKET 	Socket error.
ConnectionError 	ECONNCLOSED 	Connection is closed.
TransactionError 	ENOTBEGUN 	Transaction has not begun.
TransactionError 	EALREADYBEGUN 	Transaction has already begun.
TransactionError 	EREQINPROG 	Can't commit/rollback transaction. There is a request in progress.
TransactionError 	EABORT 	Transaction has been aborted.
RequestError 	EREQUEST 	Message from SQL Server. Error object contains additional details.
RequestError 	ECANCEL 	Cancelled.
RequestError 	ETIMEOUT 	Request timeout.
RequestError 	EARGS 	Invalid number of arguments.
RequestError 	EINJECT 	SQL injection warning.
RequestError 	ENOCONN 	No connection is specified for that request.
PreparedStatementError 	EARGS 	Invalid number of arguments.
PreparedStatementError 	EINJECT 	SQL injection warning.
PreparedStatementError 	EALREADYPREPARED 	Statement is already prepared.
PreparedStatementError 	ENOTPREPARED 	Statement is not prepared.
Detailed SQL Errors

SQL errors (RequestError with err.code equal to EREQUEST) contains additional details.

    err.number - The error number.
    err.state - The error state, used as a modifier to the number.
    err.class - The class (severity) of the error. A class of less than 10 indicates an informational message. Detailed explanation can be found here.
    err.lineNumber - The line number in the SQL batch or stored procedure that caused the error. Line numbers begin at 1; therefore, if the line number is not applicable to the message, the value of LineNumber will be 0.
    err.serverName - The server name.
    err.procName - The stored procedure name.

Informational messages

To receive informational messages generated by PRINT or RAISERROR commands use:

const request = new sql.Request()
request.on('info', info => {
    console.dir(info)
})
request.query('print \'Hello world.\';', (err, result) => {
    // ... 
})

Structure of informational message:

    info.message - Message.
    info.number - The message number.
    info.state - The message state, used as a modifier to the number.
    info.class - The class (severity) of the message. Equal or lower than 10. Detailed explanation can be found here.
    info.lineNumber - The line number in the SQL batch or stored procedure that generated the message. Line numbers begin at 1; therefore, if the line number is not applicable to the message, the value of LineNumber will be 0.
    info.serverName - The server name.
    info.procName - The stored procedure name.

Version

3.3
Metadata

Recordset metadata are accessible through the recordset.columns property.

const request = new sql.Request()
request.query('select convert(decimal(18, 4), 1) as first, \'asdf\' as second', (err, result) => {
    console.dir(result.recordset.columns)
 
    console.log(result.recordset.columns.first.type === sql.Decimal) // true 
    console.log(result.recordset.columns.second.type === sql.VarChar) // true 
})

Columns structure for example above:

{
    first: {
        index: 0,
        name: 'first',
        length: 17,
        type: [sql.Decimal],
        scale: 4,
        precision: 18,
        nullable: true,
        caseSensitive: false
        identity: false
        readOnly: true
    },
    second: {
        index: 1,
        name: 'second',
        length: 4,
        type: [sql.VarChar],
        nullable: false,
        caseSensitive: false
        identity: false
        readOnly: true
    }
}

Data Types

You can define data types with length/precision/scale:

request.input("name", sql.VarChar, "abc")               // varchar(3) 
request.input("name", sql.VarChar(50), "abc")           // varchar(50) 
request.input("name", sql.VarChar(sql.MAX), "abc")      // varchar(MAX) 
request.output("name", sql.VarChar)                     // varchar(8000) 
request.output("name", sql.VarChar, "abc")              // varchar(3) 
 
request.input("name", sql.Decimal, 155.33)              // decimal(18, 0) 
request.input("name", sql.Decimal(10), 155.33)          // decimal(10, 0) 
request.input("name", sql.Decimal(10, 2), 155.33)       // decimal(10, 2) 
 
request.input("name", sql.DateTime2, new Date())        // datetime2(7) 
request.input("name", sql.DateTime2(5), new Date())     // datetime2(5) 

List of supported data types:

sql.Bit
sql.BigInt
sql.Decimal ([precision], [scale])
sql.Float
sql.Int
sql.Money
sql.Numeric ([precision], [scale])
sql.SmallInt
sql.SmallMoney
sql.Real
sql.TinyInt
 
sql.Char ([length])
sql.NChar ([length])
sql.Text
sql.NText
sql.VarChar ([length])
sql.NVarChar ([length])
sql.Xml
 
sql.Time ([scale])
sql.Date
sql.DateTime
sql.DateTime2 ([scale])
sql.DateTimeOffset ([scale])
sql.SmallDateTime
 
sql.UniqueIdentifier
 
sql.Variant
 
sql.Binary
sql.VarBinary ([length])
sql.Image
 
sql.UDT
sql.Geography
sql.Geometry

To setup MAX length for VarChar, NVarChar and VarBinary use sql.MAX length. Types sql.XML and sql.Variant are not supported as input parameters.
SQL injection

This module has built-in SQL injection protection. Always use parameters to pass sanitized values to your queries.

const request = new sql.Request()
request.input('myval', sql.VarChar, '-- commented')
request.query('select @myval as myval', (err, result) => {
    console.dir(result)
})

Known issues
Tedious

    If you're facing problems with connecting SQL Server 2000, try setting the default TDS version to 7.1 with config.options.tdsVersion = '7_1' (issue)
    If you're executing a statement longer than 4000 chars on SQL Server 2000, always use batch instead of query (issue)

msnodesqlv8

    msnodesqlv8 has problem with errors during transactions - reported.
    msnodesqlv8 doesn't timeout the connection reliably - reported.
    msnodesqlv8 doesn't support TVP data type.
    msnodesqlv8 doesn't support request timeout.
    msnodesqlv8 doesn't support request cancellation.
    msnodesqlv8 doesn't support detailed SQL errors.
    msnodesqlv8 doesn't support Informational messages.

3.x to 4.x changes

    Library & tests are rewritten to ES6.
    Connection was renamed to ConnectionPool.
    Drivers are no longer loaded dynamically so the library is now compatible with Webpack. To use msnodesqlv8 driver, use const sql = require('mssql/msnodesqlv8') syntax.
    Every callback/resolve now returns result object only. This object contains recordsets (array of recordsets), recordset (first recordset from array of recordsets), rowsAffected (array of numbers representig number of affected rows by each insert/update/delete statement) and output (key/value collection of output parameters' values).
    Affected rows are now returned as an array. A separate number for each SQL statement.
    Directive multiple: true was removed.
    Transaction and PreparedStatement internal queues was removed.
    ConnectionPool no longer emits connect and close events.
    Removed verbose and debug mode.
    Removed support for tds and msnodesql drivers.
    Removed support for Node versions lower than 4.

Sponsors

Development is sponsored by Integromat.
License

Copyright (c) 2013-2017 Patrik Simek

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
We ♥ your boss

Selectively mirror the npm registry inside your firewall. Filter packages based on security, licensing, code quality and more. Build awesome stuff faster. Try npm Enterprise for free…

how? learn more

    patriksimek patriksimek published 7 days ago
    4.0.4 is the latest of 66 releases
    github.com/patriksimek/node-mssql
    MIT Licensed on OSI-approved terms®

Collaborators list

    patriksimek

Stats

    2,232 downloads in the last day
    19,853 downloads in the last week
    73,430 downloads in the last month
    74 open issues on GitHub
    2 open pull requests on GitHub

Try it out

    Test mssql in your browser.

Keywords

database, mssql, sql, server, msnodesql, sqlserver, tds, node-tds, tedious, node-sqlserver, sqlserver, msnodesqlv8, azure, node-mssql
Dependencies (3)

debug, generic-pool, tedious
Dependents (245)

olimpstat, ts-bootstrap, sql_orm, vutil, one-data-node, falcon-core, smn-sql, ionic-hansel, lagash-dbaccess, jsharmony-db-mssql, formio, loopback-connector-mssql, sqlectron-core, mod3, mssqlreader-stream, node-database-connectors, cwv-node, SHPS4Node-SQL, stimulsoft-reports-js, jsreport-sekure-dispatcher, node-red-contrib-mssql-pool, sails-mssqlserver, ndm-schema-generator-mssql, webdriverio-boilerplate, mssql-cr-layer, batch-importer-novacloud, base-system, node-red-contrib-mssql, Academy.Web, gcl, p360-sql, node-mssql, mssql-utilities, jenny-mssql, amasz-tools, am-sails-sqlserver, mssql-to-csv, mssql4sails, postgrator, dbjs-ms-sql, i-flicks, vesta-driver-mssql, databridge-destination-mssql, peacherine, npm-demo-primeiro-pacote, node-red-contrib-nexnode-cloud, sqlmoses, node-red-contrib-nexnode-azure, waterline-mssql, node-red-contrib-nexnode, and more