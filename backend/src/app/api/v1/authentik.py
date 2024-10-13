import fastapi


import authentik_client
from app.core.authentik import Authentik
router = fastapi.APIRouter(tags=["authentik"],prefix="/authentik")

from fastapi import Request, Response, status, Depends, HTTPException
import requests



@router.get("/login")
async def get_posts():
    return {"data": "authentik"}




@router.get("/profile")
async def get_profile():
    base_url = f'http://10.13.11.10:9000/api/v3/flows/executor/default-authentication-flow/?query=next%3D%252F'
    data = {
        "uid_field": "rabi@gmail.com",
        "password": "1234"
    }

    try:
        first_step = requests.post(base_url, data=data)
        return first_step.cookies
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
    