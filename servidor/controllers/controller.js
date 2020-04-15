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
        let competenciaGenero = req.params.genero;

        connection.query(
            'SELECT * FROM competencias WHERE id = ?',
            [idCompetencia],
            (error, competencias, fields) => {
                if (error) return console.error(error);
                if (!competencias.length) return res.status(404).send();

                let competencia = competencias[0];
                let sqlPeliculas = 'SELECT * FROM pelicula ORDER BY RAND() LIMIT 2';
                let sqlParams = []

                if(competencia.genero_id){
                    sqlPeliculas = 'SELECT * FROM pelicula WHERE genero_id = ? ORDER BY RAND() LIMIT 2';
                    sqlParams.push(competencia.genero_id);
                }

                console.log(sqlParams);
                console.log(sqlPeliculas);
                
                connection.query(
                    sqlPeliculas,
                    sqlParams,
                    (error, peliculas, fields) => {
                        if (error) return console.error(error);
                        if (!peliculas.length) return res.status(404).send();

                        res.json({ 
                            competencia: competencia.nombre, 
                            peliculas: peliculas 
                        });
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
                    'SELECT p.id, p.titulo, p.poster, votos.votos FROM ' +
                        '(SELECT v.competencia_id, v.pelicula_id, SUM(1) votos ' +
                        'FROM votos v  ' +
                        'WHERE v.competencia_id = ? ' +
                        'GROUP BY v.pelicula_id, v.competencia_id) votos ' +
                    'JOIN pelicula p on pelicula_id = p.id ' +
                    'ORDER BY votos.votos DESC LIMIT 3;',
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
    },

    createCompetencias: (req, res) => {
        if (!req.body) return res.status(400).send('Body de la consulta inválido');
        if (req.body == "" || req.body == null || !isNaN(req.body)) return res.status(422).send("No ingresó un nombre válido");

        let competenciaNombre = req.body.nombre;
        let generoCompetencia = req.body.genero;
        
        connection.query(
            'SELECT nombre FROM competencias',
            (error, competencias, fields) => {
                if (error) return console.error(error);
                let competenciasExistentes = competencias;
                competenciasExistentes.forEach(competencia => {
                    if(competencia == competenciaNombre){
                        return res.status(422).send('Esta competencia ya existe');
                    }
                });

                connection.query(
                    'INSERT INTO competencias (nombre, genero_id) VALUES (?, ?);',
                    [competenciaNombre, generoCompetencia],
                    (error, nombre, fields) => {
                        if (error) return console.error(error);
                        // estas validaciones no me funcionan
                        res.status(201).json({message: 'Competencia creada'});
                    }
                )
            }
        );
    },

    deleteVotos: (req, res) => {
        if (!req.params.id || isNaN(req.params.id)) return res.status(400).send('Competencia inválida');
    
            let idCompetencia = parseInt(req.params.id);
    
        connection.query(
            'SELECT * FROM competencias WHERE id = ?',
            [idCompetencia],
            (error, competencia, fields) => {
                if (error) return console.error(error);
                if (competencia.length === 0) return res.status(404).send("La competencia seleccionada no existe");

                connection.query(
                    'DELETE FROM votos WHERE competencia_id = ?',
                    [idCompetencia],
                    (error, results, fields) => {
                        if (error) return console.error(error);
                        
                        res.status(200).send();
                    }
                );
            }
        )
    },

    getAllGeneros: (req, res) => {
        connection.query(
            'SELECT * FROM genero;',
            (error, generos, fields) => {
                if(error) return console.error(error);
                res.json(generos);
            }
        );
    }
}

module.exports = controller;