const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',  // :3306
    user: 'root',
    password: '12345',
    database: 'todo'
})

connection.connect()


module.exports = {
    db: connection
}