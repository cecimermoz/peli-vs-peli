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

                let competencia = competencias[0];
                let sqlPeliculas = 'SELECT p.id, p.poster, p.titulo FROM pelicula p ' + 
                'JOIN director_pelicula dp ON dp.pelicula_id = p.id ' + 
                'JOIN actor_pelicula ap ON ap.pelicula_id = p.id ';
                let sqlParams = []

                if(competencia.genero_id){
                    sqlPeliculas += ' WHERE p.genero_id = ? ';
                    sqlParams.push(competencia.genero_id);
                }

                if(competencia.director_id){
                    if(sqlParams.length > 0){
                        sqlPeliculas += ' AND ';
                    } else {
                        sqlPeliculas += ' WHERE ';
                    }
                    sqlPeliculas = ' dp.director_id = ? ';
                    sqlParams.push(competencia.director_id);
                }

                if(competencia.actor_id){
                    if(sqlParams){
                        sqlPeliculas += ' AND ';
                    } else {
                        sqlPeliculas += ' WHERE ';
                    }
                    sqlPeliculas += ' ap.actor_id = ? ';
                    sqlParams.push(competencia.actor_id);
                }

                sqlPeliculas += ' ORDER BY RAND() LIMIT 2';
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

        let competenciaNombre = req.body.nombre;
        if (!competenciaNombre) return res.status(400).send("El nombre de la competencia es obligatorio");

        connection.query(
            'SELECT nombre FROM competencias',
            (error, competencias, fields) => {
                if (error) return console.error(error);/* 
                if (competencias.length > 0) return res.status(422).send("Esa competencia ya esxiste"); */

                let generoCompetencia = req.body.genero;
                let directorCompetencia = req.body.director;
                let actorCompetencia = req.body.actor;
                let insertQuery = "INSERT INTO competencias "
                let insertParams = [];
                let selectQuery = "SELECT COUNT(1) cantidad_peliculas FROM pelicula p " +
                "JOIN actor_pelicula ap ON ap.pelicula_id = p.id " + 
                "JOIN director_pelicula dp ON dp.pelicula_id = p.id ";
                let selectParams = [];


                if(generoCompetencia == 0 && actorCompetencia && directorCompetencia){
                    insertQuery += "(nombre, genero_id, director_id, actor_id) VALUES (?, ?, ?, ?);";
                    insertParams.push(competenciaNombre, generoCompetencia, directorCompetencia, actorCompetencia);
                    selectQuery += " WHERE ap.actor_id = ? AND dp.director_id = ?";
                    selectParams.push(actorCompetencia, directorCompetencia);
                } 
                else if (generoCompetencia != 0 && actorCompetencia == 0 && directorCompetencia != 0) {
                    insertQuery += "(nombre, genero_id, director_id) VALUES (?, ?, ?);";
                    insertParams.push(competenciaNombre, generoCompetencia, directorCompetencia);
                    selectQuery += " WHERE p.genero_id = ? AND dp.director_id = ?";
                    selectParams.push(generoCompetencia, directorCompetencia);
                }
                else if(generoCompetencia != 0 && actorCompetencia != 0 && directorCompetencia == 0){
                    insertQuery += "(nombre, genero_id, actor_id) VALUES (?, ?, ?);";
                    insertParams.push(competenciaNombre, generoCompetencia, actorCompetencia);
                    selectQuery += " WHERE p.genero_id = ? AND ap.actor_id = ?";
                    selectParams.push(generoCompetencia, actorCompetencia);
                }
                else if(generoCompetencia == 0 && actorCompetencia == 0 && directorCompetencia != 0){
                    insertQuery += "(nombre, director_id) VALUES (?, ?);";
                    insertParams.push(competenciaNombre, directorCompetencia);
                    selectQuery += " WHERE dp.director_id = ?";
                    selectParams.push(directorCompetencia);
                }
                else if(generoCompetencia == 0 && actorCompetencia != 0 && directorCompetencia == 0){
                    insertQuery += "(nombre, actor_id) VALUES (?, ?);";
                    insertParams.push(competenciaNombre, actorCompetencia);
                    selectQuery += " WHERE ap.actor_id = ?";
                    selectParams.push(actorCompetencia);
                }
                else if(generoCompetencia != 0 && actorCompetencia == 0 && directorCompetencia == 0){
                    insertQuery += "(nombre, genero_id) VALUES (?, ?);";
                    insertParams.push(competenciaNombre, generoCompetencia);
                    selectQuery += " WHERE p.genero_id = ?";
                    selectParams.push(generoCompetencia);

                }
                else if(generoCompetencia && actorCompetencia && directorCompetencia){
                    insertQuery += "(nombre, genero_id, director_id, actor_id) VALUES (?, ?, ?, ?);";
                    insertParams.push(competenciaNombre, generoCompetencia, directorCompetencia, actorCompetencia);
                    selectQuery += " WHERE p.genero_id = ? AND ap.actor_id = ? AND dp.director_id = ?";
                    selectParams.push(generoCompetencia, actorCompetencia, directorCompetencia);
                } 

                console.log(insertParams);
                console.log(insertQuery);
                console.log(selectParams);
                console.log(selectQuery);
                connection.query(
                    selectQuery,
                    selectParams,
                    (error, results, fields) => {
                        if (error) return console.error(error);
                        if (results[0].cantidad_peliculas < 2) return res.status(400).json("No hay dos películas que cumplan esos parámetros");

                        connection.query(
                            insertQuery,
                            insertParams,
                            (error, results, fields) => {
                                if(error) return console.error(error);
                                res.json(results);
                            }
                        );
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
    },

    getAllDirectores: (req, res) => {
        connection.query(
            'SELECT * FROM director;',
            (error, director, fields) => {
                if(error) return console.error(error);
                res.json(director);
            }
        );
    },

    getAllActores: (req, res) => {
        connection.query(
            'SELECT * FROM actor;',
            (error, actor, fields) => {
                if(error) return console.error(error);
                res.json(actor);
            }
        );
    },

    deleteCompetencias: (req, res) => {
        if (!req.params.id || isNaN(req.params.id)) return res.status(400).send('Competencia inválida');
    
        let idCompetencia = parseInt(req.params.id);
    
        connection.query(
            'SELECT * FROM competencias WHERE id = ?',
            [idCompetencia],
            (error, competencia, fields) => {
                if (error) return console.error(error);
                if (competencia.length === 0) return res.status(404).send("La competencia seleccionada no existe");

                connection.query(
                    'DELETE FROM competencias WHERE id = ?',
                    [idCompetencia],
                    (error, results, fields) => {
                        if (error) return console.error(error);
                        
                        res.status(200).send();
                    }
                );
            }
        )
    },

    editCompetencias: (req, res) => {
        if (!req.params.id || isNaN(req.params.id)) return res.status(400).send('Competencia inválida');
    
        let idCompetencia = parseInt(req.params.id);
        let nuevoNombre = req.body.nombre;
    
        connection.query(
            'SELECT * FROM competencias WHERE id = ?',
            [idCompetencia],
            (error, competencia, fields) => {
                if (error) return console.error(error);
                if (competencia.length === 0) return res.status(404).send("La competencia seleccionada no existe");

                connection.query(
                    'UPDATE competencias SET nombre = ? WHERE id = ?',
                    [nuevoNombre, idCompetencia],
                    (error, results, fields) => {
                        if (error) return console.error(error);
                        
                        res.status(200).send();
                    }
                );
            }
        )
    },
}

module.exports = controller;