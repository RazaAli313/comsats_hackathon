
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os


load_dotenv()
async def  init_db():
    """Initialize all MongoDB connections once."""
    # global blogDB, eventDB, miscDB
    

    db_client = AsyncIOMotorClient(os.getenv("DATABASE_URL"))
    DB = db_client[os.getenv("DATABASE_NAME", "hackathon")]

   
    print("MongoDB connections initialized")