const express = require('express');
const cors = require('cors');
const server = express();
const port = 3000;
const controller = require('./controllers/controller');

server.use(cors());

server.get('/competencias', controller.competencias);

server.listen(port, function(){
    console.log("Listening on port " + port);
});