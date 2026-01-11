import requests 
from dotenv import load_dotenv
import os

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")

def search(query):
    GOOGLE_URL = ""f"https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "num": 5
    }

    response = requests.get(GOOGLE_URL, params=params)
    search_results = response.json()
    content = ""

    urls = []
    for item in search_results["items"]:
        urls.append(item["link"])
    return urls
        
        


    
if __name__ == "__main__":
    print(search("news"))
    