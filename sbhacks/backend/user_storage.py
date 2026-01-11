from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import sys
import os 
from dotenv import load_dotenv

load_dotenv()

CONNECTION_STRING1 = os.getenv("CONNECTION_STRING1")
CONNECTION_STRING2 = os.getenv("CONNECTION_STRING2")

CONNECTION_STRING = CONNECTION_STRING1 + CONNECTION_STRING2

client = MongoClient(CONNECTION_STRING)

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

def get_difficulty(username):
    user = profiles_collection.find_one({"username": username})
    return user['difficulty']


def insert_user(profile_data):
    try:
        result = profiles_collection.insert_one(profile_data)
        print("user", result.inserted_id)
        return profile_data
    except DuplicateKeyError:
        print("error; username/email exists")


def log_in(username, new_diff = None, new_avi = None):
    if not username:
        return "Enter a unique username.", None
    user = profiles_collection.find_one({"username": username})
    # print(user)
    if user:
        update_needed = {}
        if new_diff and new_diff != user.get("difficulty"):
            update_needed["difficulty"] = new_diff
        if new_avi and new_avi != user.get("avatar"):
            update_needed["avatar"] = new_avi

        if update_needed:
            profiles_collection.update_one(
                {"username": username},
                {"$set": update_needed}
            )
            user.update(update_needed)
            print(f"User updated: {update_needed}")

        return f"Welcome back, {username}", user
    else:
        new_user_data = create_user_profile(
            username,
            difficulty = new_diff if new_diff else "easy",
            level = 0,
            avatar= new_avi if new_avi else "Default"
        )

        new_user = insert_user(new_user_data)
        return f"Welcome, {username}.", new_user


# if __name__ == "__main__":
#     if len(sys.argv) > 1:
#         user = sys.argv[1]
#         difficulty = sys.argv[2] if len(sys.argv) > 2 else None
#         avatar = sys.argv[3] if len(sys.argv) > 3 else None
#         message, user = log_in(user, difficulty, avatar)
#         # log_in(sys.argv[1])
#         print(message)
#     else:
#         print("HIT")