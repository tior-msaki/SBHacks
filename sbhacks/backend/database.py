import mysql
import mysql.connector


mydb = mysql.connector.connect(
    host="sbhacks-database.cld3y3l1v4sd.us-east-1.rds.amazonaws.com",
    user="admin",
    password="sbhacks2024",
    database="sbhacks_db"
)       

def get_connection(DB_CONFIG):
    return mysql.connector.connect(**DB_CONFIG) 


def create_table(cursor):
    """ 
    CREATE TABLE UserInfo( 
        uid AUTO_INCREMENT INT, 
        name VARCHAR(255), 
        difficulty ENUM("easy", "medium", "hard"), 
        opponent ENUM("Berta", "Andrew", "Sophia")
    """
    cursor.execute(


def insert_values():
    mycursor = mydb.cursor()
    sql = "INSERT INTO sbhacks VALUES (%s, %s)"
    values = 
    mycursor.execute(sql, values)

def fetch_values():
    mycursor = mydb.cursor()
    mycursor.execute("SELECT * FROM sbhacks")
    result = mycursor.fetchall()
    for row in result:
        print(row)