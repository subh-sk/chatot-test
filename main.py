import json
import os
from typing import DefaultDict, Dict, List, Optional

import httpx
import uvicorn
from fastapi import Depends, FastAPI, Form, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Create FastAPI app
app = FastAPI(title="FastAPI Web App")

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up templates
templates = Jinja2Templates(directory="templates")

# Simple user database (in a real app, you would use a proper database)
users_db = {}

# User models
class User(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str




# Simple password hashing (in a real app, use proper hashing like bcrypt)
def fake_hash_password(password: str):
    return f"fakehashed_{password}"

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not fake_hash_password(password) == user.hashed_password:
        return False
    return user

# Routes
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    user = authenticate_user(users_db, username, password)
    if not user:
        return templates.TemplateResponse(
            "login.html", 
            {"request": request, "error": "Invalid username or password"}
        )
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@app.post("/signup")
async def signup(request: Request, username: str = Form(...), email: str = Form(...), password: str = Form(...)):
    if username in users_db:
        return templates.TemplateResponse(
            "signup.html", 
            {"request": request, "error": "Username already exists"}
        )
    
    hashed_password = fake_hash_password(password)
    users_db[username] = {
        "username": username,
        "email": email,
        "hashed_password": hashed_password
    }
    return RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/pricing", response_class=HTMLResponse)
async def pricing(request: Request):
    return templates.TemplateResponse("pricing.html", {"request": request})


@app.post("/naravirtualbot")
async def chat(request: Request):
    import json as _json

    import httpx as _httpx
    try:
        payload = await request.json()
        user_ip = request.client.host
        headers = {"content-type": "application/json","User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"}

        data = {
            "identifier": payload.get("identifier"),
            "question": payload.get('question'),
            "history": payload.get("history") or [],
            "user_id": payload.get("user_id"),
            "user_ip": user_ip
        }
        print("✅ Parsed payload:", data)
        async with _httpx.AsyncClient(
            timeout=_httpx.Timeout(
                connect=10.0,
                read=30.0,
                write=10.0,
                pool=10.0
            ),
            limits=_httpx.Limits(
                max_connections=100,
                max_keepalive_connections=20
            ),
            follow_redirects=True
        ) as client:
            try:
                print("✅ Sending request to chatbot:", payload.get("chatbot_url"))
                response = await client.post(
                    payload.get("chatbot_url"), 
                    json=data,
                    headers=headers,
                    timeout=_httpx.Timeout(30.0)
                )
                response.raise_for_status()
                response_data = response.json()
                print("✅ response from chatbot:", response_data)
                if response_data.get("error"):
                    error_msg = response_data.get("error")
                    if 'ip' in error_msg.lower() and 'blocked' in error_msg.lower():
                        return JSONResponse(content={"error": "Failed to get response from chatbot", "message": "You are not allowed to use this service. Your IP is blocked. Contact us to unblock your IP."}, status_code=403)
                    else:
                        return JSONResponse(content={"error": "Failed to get response from chatbot", "message": "Something went wrong"}, status_code=500)
                return JSONResponse(content=response_data)
            except _httpx.ConnectTimeout:
                print("❌ Connection timed out while establishing connection")
                return JSONResponse(content={"error": "Connection timeout", "message": "Could not connect to the server"}, status_code=504)
            except _httpx.ReadTimeout:
                print("❌ Timeout while waiting for server response")
                return JSONResponse(content={"error": "Read timeout", "message": "Server took too long to respond"}, status_code=504)
            except _httpx.RequestError as exc:
                print(f"❌ An error occurred while requesting: {exc}")
                return JSONResponse(content={"error": "Request failed", "message": "Could not complete the request"}, status_code=500)
    except _json.JSONDecodeError:
        return JSONResponse(content={"error": "Invalid JSON", "message": "The request payload is not valid JSON"}, status_code=400)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return JSONResponse(content={"error": "Unexpected error", "message": "An unexpected error occurred"}, status_code=500)


# Run the application
if __name__ == "__main__":
    
    uvicorn.run("main:app", host="127.0.0.1", port=1234, reload=True)