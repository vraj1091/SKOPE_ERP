
import httpx
import asyncio

async def test_login():
    url = "http://localhost:8000/api/v1/auth/login"
    payload = {
        "username": "admin@store.com",
        "password": "admin123"
    }
    try:
        async with httpx.AsyncClient() as client:
            print(f"Sending request to {url}...")
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
