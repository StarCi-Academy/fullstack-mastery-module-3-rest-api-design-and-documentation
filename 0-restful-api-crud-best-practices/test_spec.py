import requests

def test(port):
    base_url = f"http://127.0.0.1:{port}"
    print(f"  [TEST] Testing restful-api-crud-best-practices on port {port}")
    
    # Flow 1: Seed one user
    res = requests.post(f"{base_url}/users/demo/seed-one", timeout=10)
    if res.status_code not in (200, 201):
        res = requests.post(f"{base_url}/users/seed", timeout=10)
        if res.status_code not in (200, 201):
            return False, f"Flow 1 failed: status={res.status_code}"
    user_id = res.json().get("id")
    
    # Flow 2: Get Users
    res = requests.get(f"{base_url}/users", timeout=10)
    if res.status_code != 200 or not isinstance(res.json(), list) or len(res.json()) == 0:
        return False, f"Flow 2 failed: status={res.status_code}"
        
    # Flow 3: Create user
    res = requests.post(f"{base_url}/users", json={"name": "Bob", "email": "bob@test.com"}, timeout=10)
    if res.status_code not in (200, 201):
        return False, f"Flow 3 failed: status={res.status_code}"
    new_id = res.json().get("id")
    
    # Flow 4: Update user
    res = requests.put(f"{base_url}/users/{new_id}", json={"name": "Bob Updated", "email": "bob2@test.com"}, timeout=10)
    if res.status_code != 200:
        return False, f"Flow 4 failed: status={res.status_code}"
        
    # Flow 6: Delete user
    res = requests.delete(f"{base_url}/users/{new_id}", timeout=10)
    if res.status_code not in (200, 204):
        return False, f"Flow 6 failed: status={res.status_code}"
        
    return True, "All REST CRUD flows passed."
