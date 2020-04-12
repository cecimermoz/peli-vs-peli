const express = require('express');
const cors = require('cors');
const server = express();
const port = 3000;
const controller = require('./controllers/controller');

server.use(cors());
server.use(express.json());

server.get('/competencias', controller.getCompetencias);
server.get('/competencias/:id/peliculas', controller.getPeliculaRandom);
server.post('/competencias/:id/voto', controller.getVoto); 

server.listen(port, function(){
    console.log("Listening on port " + port);
});

// Users = competencias
// Saints = peliculas
// User_saints = votos