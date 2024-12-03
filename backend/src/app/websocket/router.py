from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from json.decoder import JSONDecodeError



from app.websocket.handlers import websocket_manager
import logging

logger = logging.getLogger(__name__)
websocket_router = APIRouter()


@websocket_router.websocket("/ws/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    # current_user: User = Depends(get_current_user),
    #handle cache
    ):
    await websocket_manager.connect_socket(websocket)

    await websocket_manager.add_user_socket_connetion(current_user.id, websocket)

    # mark the user online

    # get all the users in the chat


    try:
        while True:
            try:
                print("waiting for data")
                # incoming_events = await websocket.receive_json()
                # dict_data = dict(incoming_events)
                # logger.info(f"Received event: {dict_data.get('event')}")

                # event = dict_data.get("event")
                # handler = socket_manager.handlers.get(event)
                # if not handler:
                #     logger.error(f"No handler [{event}] exists")
                #     await socket_manager.send_error(f"Type: {event} was not found", websocket)
                #     continue
                # await handler(websocket=websocket, db_session=db, data=dict_data, current_user=current_user, cache=cache, cache_enabled=cache_enabled)
            except (JSONDecodeError, AttributeError) as excinfo:
                logger.exception(f"Websocket error, detail: {excinfo}")
                await socket_manager.send_error("Wrong data format", websocket)
                continue
            except ValueError as excinfo:
                logger.exception(f"Websocket error, detail: {excinfo}")
                await socket_manager.send_error("Could not validate incoming data", websocket)
    except WebSocketDisconnect:
        logging.info("Websocket is disconnected")
        await socket_manager.remove_user_guid_to_websocket(user_uid=str(current_user['uid']), websocket=websocket)