from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from search_engine import search
from scraper import process_html

from dotenv import load_dotenv
import os
load_dotenv()

api_key = os.getenv("")

app = FastAPI()

# Enable CORS so your React app can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
)


@app.route('/get-topic')
def get_topic():
    file_path = "./topics.txt"
    with open(file_path, 'r') as f:
        idx = random.randint(51)
        for i in range(idx):
            f.readline()
        topic = f.readline()

@app.route('/get-hints/{topic}')
def get_hints(topic):
    urls = search(topic)
    s = requests.Session()
    for url in urls:
        info = process_html(s, url)


@app.route('/get-counterargument')
def counterargument(topic, difficulty):
    with open('system_blueprint.json', 'r') as file:
        data = json.load(file)
    contents = "The topic is {topic}."
    contents += data["global_policy"]
    contents += data["agents"][difficulty]["prompt"]
    client = genai.Client(api_key = api_key)

    response = client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=contents
    )

    return response.text
    

@app.route('/get-winner')
def get_feedback(argument, counterargument, topic):
    contents = "The topic is {topic}. This is the argument: {argument}. This is the counter argument:{counterargument}. Do not be biased on emotion. Determine whose argument is better SOLELY based on clarity, organization, structure, and relevance. Your answer should be 'argument' or 'counterargument'"

    client = genai.Client(api_key = api_key)

    response = client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=contents
    )
    if response.text == 'argument':
        return 0 #returns whether the first argument or second was better
    return 1

@app.route('/get-feedback')
def get_feedback(argument, topic):
    contents = "This is the user argument: {argument} for topic {topic}. Provide 2 bullet points of constructive criticism based on good speech and debate principals. Maintain politeness."

    client = genai.Client(api_key = api_key)

    response = client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=contents
    )
    return response.text
