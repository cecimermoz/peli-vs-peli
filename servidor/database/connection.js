const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : "localhost",
    port     : "3306",
    user     : "root",
    password : "",
    database : "competencias", 
});

module.exports = connection;