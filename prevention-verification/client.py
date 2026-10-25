# Controlled CI verification fixture. Scanned only; never deployed or executed.
import requests

def fetch_report(url):
    return requests.get(url, verify=True)
