from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from search_engine import search
from scraper import process_html

app = FastAPI()

# Enable CORS so your React app can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
)


@app.route('/get-topic')
def get_topic():
    file_path = "./topics.txt"
    with open(file_path) as f:
        idx = random.randint(51)
        for i in range(idx):
            f.readline()
        topic = f.readline()

@app.route('/get-hints/{topic}')
def get_hints(topic):
    urls = search(topic)
    for url in urls:
        s = requests.Session()
        process_html(s, url)
