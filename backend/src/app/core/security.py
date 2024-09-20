import bcrypt

from .config import settings

from datetime import datetime, timedelta, timezone, UTC
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import jwt
EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS = settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM


def get_password_hash(password: str) -> str:
    hashed_password: str = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    return hashed_password


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    correct_password: bool = bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    return correct_password

def generate_email_verification_token(email: str, expires_delta: timedelta | None = None)-> str:
    if expires_delta:
        expire = datetime.now(UTC).replace(tzinfo=None) + expires_delta
    else:
        expire = datetime.now(UTC).replace(tzinfo=None) + timedelta(hours=EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": email}
    to_encode.update({"exp": expire, "utility": "EMAIL_VERIFICATION"})

    encoded_jwt: str = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print("dadada",encoded_jwt)
    return encoded_jwt

async def send_email(email, body, subject):
    sender_email = f"{settings.EMAIL_SENDER}"
    smtp_host = f"{settings.SMTP_HOST}"
    smtp_port = 587
    smtp_username = f"{settings.SMTP_USERNAME}"
    smtp_password = f"{settings.SMTP_PASSWORD}"

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(sender_email, email, message.as_string())
    except Exception as e:
        # You might want to handle the exception based on your application's requirements
        print(f"Failed to send verification email: {str(e)}")

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except e:
        return None