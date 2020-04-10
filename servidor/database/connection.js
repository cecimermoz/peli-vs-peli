const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
    database : "competencias", 
});

module.exports = connection;