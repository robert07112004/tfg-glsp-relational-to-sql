Fecha: 1/6/2026, 19:50:28

CREATE TABLE director (
    nombre VARCHAR(255) NOT NULL PRIMARY KEY,
    nacionalidad VARCHAR(255) NOT NULL
);

CREATE TABLE pelicula (
    titulo VARCHAR(255) NOT NULL PRIMARY KEY,
    nacionalidad VARCHAR(255) NOT NULL,
    productora VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    nombre_director VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (nombre_director) REFERENCES director(nombre) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE actor (
    nombre VARCHAR(255) NOT NULL PRIMARY KEY,
    nacionalidad VARCHAR(255) NOT NULL,
    sexo BIT(1) NOT NULL
);

CREATE TABLE participa (
    titulo_pelicula VARCHAR(255) NOT NULL,
    nombre_actor VARCHAR(255) NOT NULL,
    tipo_part VARCHAR(255) NOT NULL,
    PRIMARY KEY (titulo_pelicula, nombre_actor, tipo_part),
    FOREIGN KEY (titulo_pelicula) REFERENCES pelicula(titulo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (nombre_actor) REFERENCES actor(nombre) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ejemplar (
    num_ejemplar INT NOT NULL PRIMARY KEY,
    titulo_pelicula VARCHAR(255) NOT NULL UNIQUE,
    conservacion VARCHAR(255) NOT NULL,
    FOREIGN KEY (titulo_pelicula) REFERENCES pelicula(titulo) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE socio (
    DNI VARCHAR(9) NOT NULL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    tel VARCHAR(9) NOT NULL,
    avalado_por VARCHAR(9) NOT NULL UNIQUE,
    FOREIGN KEY (avalado_por) REFERENCES socio(DNI) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE alquilado (
    titulo VARCHAR(255) NOT NULL,
    num_ej INT NOT NULL,
    DNI_soc VARCHAR(9) NOT NULL,
    fecha_c DATE NOT NULL,
    fecha_f DATE NOT NULL,
    PRIMARY KEY (titulo, num_ej, DNI_soc, fecha_c),
    FOREIGN KEY (titulo) REFERENCES ejemplar(titulo_pelicula) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (num_ej) REFERENCES ejemplar(num_ejemplar) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (DNI_soc) REFERENCES socio(DNI) ON DELETE CASCADE ON UPDATE CASCADE
);
