import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:test@localhost:5432/snaprecall")  
# here test = password and snaprecall = dbname and user= postgres
engine = create_engine(DATABASE_URL)