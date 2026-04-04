from fastapi import FastAPI, Request, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import time

load_dotenv()

app = FastAPI(title="FireCare API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's mobile + local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores (mocking Firestore for hackathon speed to ensure it works instantly, will sync to chain)
emergencies_db = {}
responders_db = {}
vote_store = {}

@app.post("/api/emergency/trigger")
async def trigger_emergency(request: Request):
    try:
        data = await request.json()
        severity = data.get("severity", "MAJOR")
        user_id = data.get("user_id", "anonymous")
        location = data.get("location", "unknown")

        e_id = str(int(time.time()))
        emergencies_db[e_id] = {
            "id": e_id,
            "severity": severity,
            "user_id": user_id,
            "location": location,
            "status": "PENDING",
            "responders": []
        }

        # Here we would normally trigger FCM to neatest 50 users

        return JSONResponse(content={"message": "Emergency broadcasted to 50 nearest users", "emergency": emergencies_db[e_id]})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/emergencies")
def get_emergencies():
    return emergencies_db

@app.post("/api/score/calculate")
async def calculate_score(request: Request):
    """
    Calculate responder score based on:
    accuracy (AI check on image/description)
    speed_factor (time delta)
    enquiry_quality (questions asked)
    """
    try:
        data = await request.json()
        responder = data.get("responder")
        time_taken_mins = data.get("time_taken", 10)
        accuracy = data.get("accuracy", 80)
        enquiry = data.get("enquiry", 70)

        # Formula:
        # speed_factor: 100 - (minutes_taken * 2) capped at 0
        speed_f = max(0, 100 - (time_taken_mins * 2))
        
        score = (accuracy * 0.4) + (speed_f * 0.4) + (enquiry * 0.2)

        return JSONResponse(content={"responder": responder, "score": score})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/api/ai/scan")
async def ai_scan(file: UploadFile = File(...)):
    # Mocking Gemini Vision scan for hackathon layout speed
    return JSONResponse(content={
        "is_emergency": True,
        "severity": "MAJOR",
        "description": "Appears to be a significant fire hazard with structural damage indicated. Urgent dispatch recommended."
    })
