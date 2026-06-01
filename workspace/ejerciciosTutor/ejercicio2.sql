Fecha: 1/6/2026, 19:57:17

CREATE TABLE curso (
    codigo_curso INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    horas TIME NOT NULL
);

CREATE TABLE prerrequisito (
    codigo_c INT NOT NULL,
    su_prerrequisito INT NOT NULL,
    opcional VARCHAR(255),
    PRIMARY KEY (codigo_c, su_prerrequisito),
    FOREIGN KEY (codigo_c) REFERENCES curso(codigo_curso) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (su_prerrequisito) REFERENCES curso(codigo_curso) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE edicion (
    cod_edicion INT NOT NULL PRIMARY KEY,
    cod_c INT NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    FOREIGN KEY (cod_c) REFERENCES curso(codigo_curso) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE empleado (
    cod_e INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    dir VARCHAR(255) NOT NULL,
    tlf VARCHAR(9) NOT NULL
);

CREATE TABLE participa (
    cod_edicion INT NOT NULL,
    codigo_e INT NOT NULL,
    tipo_p VARCHAR(255) NOT NULL,
    PRIMARY KEY (cod_edicion, codigo_e),
    FOREIGN KEY (cod_edicion) REFERENCES edicion(cod_edicion) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (codigo_e) REFERENCES empleado(cod_e) ON DELETE CASCADE ON UPDATE CASCADE
);
