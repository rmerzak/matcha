import cloudinary.uploader
from fastapi import UploadFile
from app.core.config import settings

class CloudinaryService:
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )

    async def upload_image(self, file: str | UploadFile):
        if isinstance(file, UploadFile):
            allowed_formats = ["image/jpeg", "image/png", "image/gif"]
            if file.content_type not in allowed_formats:
                raise ValueError("Only image files are allowed")
            upload_file = file.file
        else:
            upload_file = file

        try:
            result = cloudinary.uploader.upload(upload_file)
            return result["secure_url"]
        except Exception as e:
            raise RuntimeError(f"Image upload failed: {str(e)}")