CREATE TABLE votos (
    id INT(6) AUTO_INCREMENT PRIMARY KEY,
    competencia_id INT(3),
    pelicula_id INT(11),
    FOREIGN KEY (competencia_id) REFERENCES competencias(id),
);


    FOREIGN KEY (pelicula_id) REFERENCES pelicula(id)
