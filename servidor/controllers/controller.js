const connection = require('../database/connection');

const controller = {
    competencias: (req, res) => {

        connection.query(
            'SELECT * FROM competencias',
            (error, competencias, fields) => {
                res.json(competencias);
            }
        );
    }
}

module.exports = controller;