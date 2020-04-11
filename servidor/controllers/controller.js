const connection = require('../database/connection');

const controller = {
    getCompetencias: (req, res) => {
        connection.query(
            'SELECT * FROM competencias',
            (error, competencias, fields) => {
                res.json(competencias);
            }
        );
    },
    getPeliculaRandom: (req, res) => {
        let idCompetencia = parseInt(req.params.id);

        connection.query(
            'SELECT * FROM competencias WHERE id = ?',
            [idCompetencia],
            (error, competencias, fields) => {
                if (error) return console.error(error);
                if (!competencias.length) return res.status(404).send();

                let competencia = competencias[0].nombre;

                connection.query(
                    'SELECT * FROM pelicula ORDER BY RAND() LIMIT 2',
                    (error, peliculas, fields) => {
                        if (error) return console.error(error);
                        if (!peliculas.length) return res.status(404).send();

                        res.json( { competencias, peliculas } );
                    }
                )

            }
        )
    }
/*     obtenerPeliculas: (req, res) => {
        let idCompetencia = parseInt(req.params.id);
        let reqBody = req.body;

        connection.query(
            'SELECT * FROM pelicula WHERE id = ?',
            [idPelicula],
            (error, pelicula, fields) => { 
                if (error) return console.error(error);
                if (!pelicula.length) return res.status(404).send();

                return res.json(idPelicula);
            }
        );
    } */
}

module.exports = controller;