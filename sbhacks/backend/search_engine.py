import requests 
import python_dotenv
import os

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")