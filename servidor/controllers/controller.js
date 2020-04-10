const connection = require('../database/connection');

const controller = {
    competencias: (req, res) => {

        connection.query(
            'SELECT * FROM actor',
            (error, results, fields) => {
                res.json(results);
            }
        );
    }
}

module.exports = controller;