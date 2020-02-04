# --IMPORT
import pymysql
from datetime import datetime

# --VARIABILI

boolD = False


# --FUNZIONI
def createQuery(header, attr):
    query = "INSERT INTO Aziende ("
    for col in header:
        query += col
        if header.index(col) != len(header) - 1:
            query += ","
        else:
            query += ")"

    query += "VALUES ("

    for el in range(len(attr)):

        if el == 5 or el == 9:
            v = attr[el]
            if v == "" or v == "null":
                v = "NULL"

            query += f"{v}"

        elif el == 10:
            date = attr[10]
            if date == "" or date == "null":
                date = "NULL"
                query += f"{date}"
            else:
                date = datetime.strptime(date, '%d-%m-%Y').strftime('%Y/%m/%d')
                query += f"\"{date}\""
        else:
            query += f"\"{attr[el]}\""

        if el != len(attr) - 1:
            query += ","
        else:
            query += ")"

    return query


# --MAIN
if __name__ == "__main__":
    if boolD:
        print("Start")

    db = pymysql.connect("remotemysql.com", "V1h7DQxhnB", "k36A91EtFI", "V1h7DQxhnB")
    #db = pymysql.connect("localhost", "root", "", "aziende")
    cursor = db.cursor()

    cursor.execute("TRUNCATE Aziende")

    file_azienda = open("../doc/export_aziende_2020_01_20.csv", "r")

    query = ""
    header = []
    attributes = [] * 14
    row_number = 0
    err = open("error.txt", "w")
    for row in file_azienda:
        if row_number == 0:
            header = row.split(";")
            header[0] = header[0].lstrip("ï»¿")
            header[len(header) - 1] = header[len(header) - 1].rstrip("\n")
        else:
            attributes = row.split(";")
            attributes[len(attributes) - 1] = attributes[len(attributes) - 1].replace("\n", "")
            result = createQuery(header, attributes)

            try:
                cursor.execute(result)
            except Exception as error:
                err.write("\nQuery: " + str(result) + "\nERRORE: " + str(error))

        row_number += 1

    err.close()
    file_azienda.close()
    db.commit()
    db.close()

    if boolD:
        print("End")
