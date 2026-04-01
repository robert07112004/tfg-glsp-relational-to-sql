-- ======================================================
-- Script SQL generado por GLSP a las 1/4/2026, 17:48:33
-- ======================================================

CREATE TABLE Pais (
    id INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);

CREATE TABLE Autor (
    id INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    pais_id INT NOT NULL,
    FOREIGN KEY (pais_id) REFERENCES Pais(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Editorial (
    id INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    pais_id INT NOT NULL,
    FOREIGN KEY (pais_id) REFERENCES Pais(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Libro (
    id INT NOT NULL PRIMARY KEY,
    titulo VARCHAR(20) NOT NULL,
    autor_id INT NOT NULL,
    editorial_id INT NOT NULL,
    FOREIGN KEY (autor_id) REFERENCES Autor(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (editorial_id) REFERENCES Editorial(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Edicion (
    id INT NOT NULL PRIMARY KEY,
    año DATE NOT NULL,
    libro_id INT NOT NULL,
    FOREIGN KEY (libro_id) REFERENCES Libro(id) ON DELETE CASCADE ON UPDATE CASCADE
);
