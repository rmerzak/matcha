import fastapi


import authentik_client
from app.core.authentik import Authentik
router = fastapi.APIRouter(tags=["authentik"],prefix="/authentik")





@router.get("/login")
async def get_posts():
    return {"data": "authentik"}



@router.get("/profile")
async def get_profile():
    authentik = Authentik()
    # base_url = 'http://localhost:9000/api/v3/flows/executor/default-authentication-flow/'
    # headers = {
    #     'authorization': f'Bearer {token}',
    #     'content-type': 'application/json',
    # }

    # first_step = requests.get(base_url, headers=headers)
    groups = authentik.fetchAdmins()
    return groups