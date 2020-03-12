CREATE TABLE Aziende
    (
     ID INTEGER NOT NULL AUTO_INCREMENT,
     Tipologia VARCHAR (16) NOT NULL ,
     Ragione_sociale VARCHAR (64) NOT NULL ,
     Comune VARCHAR (64) NOT NULL ,
     Provincia VARCHAR (2) NOT NULL ,
     Indirizzo VARCHAR (32) NOT NULL ,
     CAP INTEGER NOT NULL ,
     Telefono VARCHAR (32) NOT NULL ,
     Email VARCHAR (32) ,
     Sito_Web VARCHAR (64) ,
     Dipendenti INTEGER ,
     Data_convenzione DATE ,
     Settore VARCHAR (32) NOT NULL ,
     Codice_ATECO VARCHAR (32) NOT NULL ,
     Descrizione TEXT,
     PRIMARY KEY (ID)
    );