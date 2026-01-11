from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import sys

connection_string = (...) 
client = MongoClient(connection_string)

db = client["user_db"]
profiles_collection = db["user_profiles"]
profiles_collection.create_index("username", unique=True)


def create_user_profile(username, difficulty, level, avatar):
    """
    Creates a user profile dictionary to be inserted into MongoDB.
    
    In a real application, the password should be hashed before storage.
    """
    user_data = {
        "username": username,
        "difficulty": difficulty,
        "level": level,
        "avatar": avatar
    }

    return user_data

def insert_user(profile_data):
    try:
        result = profiles_collection.insert_one(profile_data)
        print("user", result.inserted_id)
        return profile_data
    except DuplicateKeyError:
        print("error; username/email exists")


def log_in(username):
    if not username:
        print("fuck off")
        return
    user = profiles_collection.find_one({"username": username})
    print(user)
    if user:
        print("were in")
        return user
    else:
        new_user_data = create_user_profile(
            "user1",
            "easy",
            0,
            "Default"
        )

        insert_user(new_user_data)

# if __name__ == "__main__":
#     if len(sys.argv) > 1:
#         log_in(sys.argv[1])
#     else:
#         print("HIT")
        