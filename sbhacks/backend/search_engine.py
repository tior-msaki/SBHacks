import requests 
from dotenv import load_dotenv
import os

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")


search_query = "neural nine books"
url = ""f"https://www.googleapis.com/customsearch/v1"
params = {
    "key": GOOGLE_API_KEY,
    "cx": SEARCH_ENGINE_ID,
    "q": search_query,
    "num": 5
}

response = requests.get(url, params=params)
results = response.json()

for item in results:
    url = item["items"]["link"]
    response = requests.get(url, params=params)
    results = response.json()



# 200 is the HTTP status code for a successful request
# if response.status_code == 200:
#     if 'items' in result 
    