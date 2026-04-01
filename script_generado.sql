-- ======================================================
-- Script SQL generado por GLSP a las 1/4/2026, 17:13:52
-- ======================================================

CREATE TABLE Empleado (
    id INT NOT NULL PRIMARY KEY,
    jefe_id INT NULL,
    FOREIGN KEY (jefe_id) REFERENCES Empleado(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Etapa (
    id INT NOT NULL PRIMARY KEY,
    etapa_siguiente_id INT NULL UNIQUE,
    FOREIGN KEY (etapa_siguiente_id) REFERENCES Etapa(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Cursos (
    id INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);

CREATE TABLE Prerrequisitos (
    curso_id INT NULL,
    prerrequisito_id INT NULL,
    PRIMARY KEY (curso_id, prerrequisito_id),
    FOREIGN KEY (curso_id) REFERENCES Cursos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (prerrequisito_id) REFERENCES Cursos(id) ON DELETE CASCADE ON UPDATE CASCADE
);
