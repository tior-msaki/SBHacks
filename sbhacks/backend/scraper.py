import requests 
from bs4 import BeautifulSoup
import threading

MAX_DEPTH = 10 

#Extract links given a frontier of web pages
def extract_links(frontier:list) -> list:
    urls = [] 
    depth = 0
    session = requests.Session()
    while depth < MAX_DEPTH and frontier:
        try: 
            url = frontier.pop(0)
            response = session.get(url)
            if response.status_code != 200:
                raise Exception("Invalid response")
            html_doc = response.text
            soup = BeautifulSoup(html_doc, 'html.parser')
            link_elements = soup.select("a[href]") 
            link_elements = set(link_elements) #remove duplicates
            #we only extract the a html tags that have a reference attribute 
            #example: <a href="">

            urls = set() #prevent exact duplicates

            for link_el in link_elements:
                raw_url = link_el["href"]
                abs_url = absolute_url(url, raw_url)

                frontier.append(abs_url)
                urls.add(abs_url)

                print("CONTENT IS", process_html(abs_url))
            
            depth += 1
            
        except Exception as e:
            print(f"Error: {e}")
            return
    
    return urls

#Convert a raw url to an absolute url
def absolute_url(target_url, url):
    if not url.startswith("http"):
        url = requests.compat.urljoin(target_url, url) 
    return url

def process_html(session, url):
    response = session.get(url)
    if response.status_code != 200:
        return
    soup = BeautifulSoup(response.text, 'html.parser')
    for tag in soup.find_all(['script', 'style', 'span', 'div']):
        tag.decompose()
    text = soup.get_text(strip=True, separator=' ')
    return text

if __name__ == "__main__":
    s = requests.Session() #reuse a session object
    print(process_html(s, html_doc))
    