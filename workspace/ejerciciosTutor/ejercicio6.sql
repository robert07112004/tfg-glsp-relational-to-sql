-- Fecha: 20/6/2026, 17:16:11

CREATE TABLE Familia (
    codigo INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    PRIMARY KEY (codigo)
);

CREATE TABLE Laboratorio (
    codigo INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tlf VARCHAR(9) NOT NULL,
    dir VARCHAR(255) NOT NULL,
    fax VARCHAR(255) NOT NULL,
    contacto VARCHAR(255) NOT NULL,
    PRIMARY KEY (codigo)
);

CREATE TABLE Medicamento (
    codigo INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    stock INT NOT NULL,
    vendidas INT NULL,
    precio DECIMAL(8, 2) NOT NULL,
    receta VARCHAR(255) NOT NULL,
    cod_familia INT NOT NULL,
    cod_laboratorio INT NULL,
    PRIMARY KEY (codigo),
    FOREIGN KEY (cod_familia) REFERENCES Familia(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cod_laboratorio) REFERENCES Laboratorio(codigo) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Cliente (
    DNI VARCHAR(9) NOT NULL,
    tlf VARCHAR(9) NOT NULL,
    dir VARCHAR(255) NOT NULL,
    PRIMARY KEY (DNI)
);

CREATE TABLE Comp_efec (
    cod_medicamento INT NOT NULL,
    DNI_cliente VARCHAR(9) NOT NULL,
    Fecha_comp DATE NOT NULL,
    unidades INT NOT NULL,
    PRIMARY KEY (cod_medicamento, DNI_cliente, Fecha_comp),
    FOREIGN KEY (cod_medicamento) REFERENCES Medicamento(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (DNI_cliente) REFERENCES Cliente(DNI) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE C_credito (
    DNI VARCHAR(9) NOT NULL,
    datos_banco VARCHAR(255) NOT NULL,
    PRIMARY KEY (DNI),
    FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Comp_cred (
    cod_medicamento INT NOT NULL,
    DNI_cliente VARCHAR(9) NOT NULL,
    fecha_comp DATE NOT NULL,
    unidades INT NOT NULL,
    fecha_pago DATE NOT NULL,
    PRIMARY KEY (cod_medicamento, DNI_cliente, fecha_comp),
    FOREIGN KEY (cod_medicamento) REFERENCES Medicamento(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (DNI_cliente) REFERENCES C_credito(DNI) ON DELETE CASCADE ON UPDATE CASCADE
);
