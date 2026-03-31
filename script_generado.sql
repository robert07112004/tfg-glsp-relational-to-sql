-- ======================================================
-- Script SQL generado por GLSP a las 31/3/2026, 18:27:50
-- ======================================================

CREATE TABLE Pedido (
    id INT NOT NULL PRIMARY KEY,
    fecha DATE NOT NULL,
    cliente VARCHAR(20) NOT NULL
);

CREATE TABLE Linea_Pedido (
    id_pedido INT NOT NULL,
    num_linea INT NOT NULL,
    cantidad FLOAT(2) NOT NULL,
    PRIMARY KEY (id_pedido, num_linea),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id) ON DELETE CASCADE ON UPDATE CASCADE
);
