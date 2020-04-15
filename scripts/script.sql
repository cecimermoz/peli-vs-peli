CREATE TABLE competencias(
    id INT(3) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);

INSERT INTO competencias (nombre)
VALUES
    ("¿Cuál es la mejor película?"),
    ("¿Qué drama te hizo llorar más?"),
    ("¿Cuál es la peli más bizarra?"),
    ("¿Qué película viste más vece?"),
    ("¿Cuál es la peli más tonta?"),
    ("¿Qué peli te asustó más?")
;

CREATE TABLE votos (
    id INT(6) AUTO_INCREMENT PRIMARY KEY,
    competencia_id INT(3),
    pelicula_id INT(11) UNSIGNED,
    FOREIGN KEY (competencia_id) REFERENCES competencias(id),
    FOREIGN KEY (pelicula_id) REFERENCES pelicula(id)
);

ALTER TABLE competencias 
ADD COLUMN genero_id INT UNSIGNED;

ALTER TABLE competencias
ADD FOREIGN KEY (genero_id) REFERENCES genero(id);

ALTER TABLE competencias 
ADD COLUMN director_id INT UNSIGNED;

ALTER TABLE competencias
ADD FOREIGN KEY (director_id) REFERENCES director(id);

ALTER TABLE competencias 
ADD COLUMN actor_id INT UNSIGNED;

ALTER TABLE competencias
ADD FOREIGN KEY (actor_id) REFERENCES actor(id);