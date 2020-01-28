# --IMPORT
import pymysql

# --VARIABILI

boolD = True


# --FUNZIONI
def createQuery(header, attr):
    query = "INSERT INTO Aziende ("
    for col in header:
        query += col
        if header.index(col) != len(header) - 1:
            query += ","
        else:
            query += ")"

    query += "\nVALUES ("
    for val in range(len(attr)-1):
        print(val)
        if val == 5 or val == 9:
            query += attr[val]
        elif val == 10:
            if attr[val] != "":
                query += "TO_DATE(\'" + attr[val] + "\', \'DD/MM/YYYY\')"

        else:
            if attr[val] == "":
                a = "Dato non presente"
            else:
                a = attr[val]
            query += "\"" + a + "\""

        if val != len(attr) - 1:
            query += ","
        else:
            query += ")"

    return query


# --MAIN
if __name__ == "__main__":
    if boolD:
        print("Start")

    db = pymysql.connect("remotemysql.com", "V1h7DQxhnB", "k36A91EtFI", "V1h7DQxhnB")
    cursor = db.cursor()

    file_azienda = open("../doc/export_aziende_2020_01_20.csv", "r")

    query = ""
    header = []
    attributes = [] * 14
    row_number = 0
    for row in file_azienda:
        if row_number == 0:
            header = row.split(";")
            header[0] = header[0].lstrip("ï»¿")
            header[len(header) - 1] = header[len(header) - 1].rstrip("\n")
        else:
            attributes = row.split(";")
            attributes[len(attributes) - 1] = attributes[len(attributes) - 1].replace("\n", "")
            query = createQuery(header, attributes)
            print(query)
            cursor.execute(query)

        row_number += 1


    file_azienda.close()
    db.commit()
    db.close()

    if boolD:
        print("End")
