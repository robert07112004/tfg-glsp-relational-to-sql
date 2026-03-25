-- ======================================================
-- Script SQL generado por GLSP a las 24/3/2026, 18:26:15
-- ======================================================

CREATE TABLE Persona (
    dni VARCHAR(9),
    nombre VARCHAR(250) NOT NULL,
    PRIMARY KEY (dni)
);

CREATE TABLE Vehiculo (
    matricula VARCHAR(7),
    dni VARCHAR(9) NULL UNIQUE,
    PRIMARY KEY (matricula),
    FOREIGN KEY (dni) REFERENCES Persona(dni) ON DELETE RESTRICT ON UPDATE RESTRICT
);
