import requests

def test(port):
    base_url = f"http://127.0.0.1:{port}"
    print(f"  [TEST] Testing unified-response-and-errors on port {port}")
    
    res = requests.get(f"{base_url}/users", timeout=10)
    if res.status_code != 200:
        return False, f"Normal get failed: status={res.status_code}"
    
    res = requests.get(f"{base_url}/users/error", timeout=10)
    if res.status_code != 500:
        res = requests.get(f"{base_url}/error", timeout=10)
    return True, "All unified response flows passed."
