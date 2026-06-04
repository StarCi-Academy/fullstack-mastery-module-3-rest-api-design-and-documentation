import requests

def test(port):
    base_url = f"http://127.0.0.1:{port}"
    print(f"  [TEST] Testing dtos-and-validation on port {port}")
    
    # Flow 1: Invalid payload (should get 400 Bad Request)
    res = requests.post(f"{base_url}/users", json={"name": "A", "email": "invalid-email"}, timeout=10)
    if res.status_code != 400:
        return False, f"Validation failure expected 400, got status={res.status_code}, body={res.text}"
        
    # Flow 2: Valid payload (needs age between 18 and 100)
    res = requests.post(f"{base_url}/users", json={"name": "Alice", "email": "alice@example.com", "age": 20}, timeout=10)
    if res.status_code not in (200, 201):
        return False, f"Valid post failed: status={res.status_code}, body={res.text}"
        
    return True, "All validation flows passed."
