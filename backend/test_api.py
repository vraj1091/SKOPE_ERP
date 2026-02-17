import requests
try:
    print("Sending request to sales endpoint...")
    # Note: This will likely fail with 401 if I don't provide a token, but if it returns 500, that's what we want to capture.
    # But wait, if it returns 401, it's NOT a 500. The user said 500.
    # The user is probably logged in on the frontend, sending a token.
    # If I send a request without a token, I expect 401. 
    # If I get 500 without a token, then the auth middleware itself is crashing!
    response = requests.get("http://localhost:3000/api/v1/sales/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
