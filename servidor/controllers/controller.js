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

                        res.json( { competencia, peliculas } );
                    }
                )

            }
        )
    },

    votar: (req, res) => {
    if (!req.params.id || isNaN(req.params.id)) return res.status(400).send('Competencia inválida');
    if (!req.body) return res.status(400).send('Body de la consulta inválido');

        let idCompetencia = parseInt(req.params.id);
        // el front envía {'idPelicula': idPelicula}
        let idPelicula = req.body.idPelicula;

        if (!idPelicula) return res.status(400).send("Id de película inválido");

        connection.query(
            'SELECT * FROM competencias WHERE id = ?',
            [idCompetencia],
            (error, competencias, fields) => {
                if (error) return console.error(error);
                if (!competencias.length) return res.status(404).send("La competencia seleccionada no existe");

                // let competencia = competencias[0].nombre;

                connection.query(
                    'SELECT * FROM pelicula WHERE id = ?',
                    [idPelicula],
                    (error, pelicula, fields) => {
                        if (error) return console.error(error);
                        if (!pelicula.length) return res.status(404).send("La película seleccionada no existe");
        
                        let peli = pelicula[0];
        
                        connection.query(
                            'INSERT INTO votos (competencia_id, pelicula_id) VALUES (?,?)',
                            [idCompetencia, idPelicula],
                            (error, results, fields) => {
                                
                                if (error) console.error(error);

                                res.status(201).json({message: 'ok'});
                            }
                        );
                    }
                )
            }
        )

    },

    getVotodeCompetencia: (req, res) => {
        if (!req.params.id || isNaN(req.params.id)) return res.status(400).send('Competencia inválida');

        let idCompetencia = parseInt(req.params.id);

        connection.query(
            'SELECT * FROM competencias WHERE id = ?',
            [idCompetencia],
            (error, competencias, fields) => {
                if (error) return console.error(error);
                if (!competencias.length) return res.status(404).send("La competencia seleccionada no existe");

                connection.query(
                    'SELECT p.id, p.titulo, p.poster, votos.qty FROM ' +
                        '(SELECT v.competencia_id, v.pelicula_id, SUM(1) qty ' +
                        'FROM votos v  ' +
                        'WHERE v.competencia_id = ? ' +
                        'GROUP BY v.pelicula_id, v.competencia_id) votos ' +
                    'JOIN pelicula p on pelicula_id = p.id;',
                    [idCompetencia],
                    (error, votos, fields) => {
                        if (error) return console.error(error);

                        res.json({
                            competencia : competencias[0].nombre,
                            resultados : votos
                        })
                    }
                );

            }
        )
    }

}

module.exports = controller;