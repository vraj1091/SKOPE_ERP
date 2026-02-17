import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_dashboard():
    # 1. Login
    print("Logging in...")
    try:
        login_resp = requests.post(f"{BASE_URL}/auth/login", json={
            "username": "admin@skpoe.com",
            "password": "admin123"
        })
    except Exception as e:
        print(f"Could not connect to backend: {e}")
        return

    if login_resp.status_code != 200:
        print(f"Login Failed: {login_resp.status_code} - {login_resp.text}")
        return
    
    token = login_resp.json()["access_token"]
    print("Login Successful. Token received.")

    # 2. Get Dashboard Stats
    print("\nFetching Dashboard Stats...")
    headers = {"Authorization": f"Bearer {token}"}
    stats_resp = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    
    if stats_resp.status_code != 200:
        print(f"Stats Failed: {stats_resp.status_code} - {stats_resp.text}")
    else:
        print("Stats Received:")
        print(stats_resp.json())

if __name__ == "__main__":
    test_dashboard()
