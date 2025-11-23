import logging
from fastapi import FastAPI
from app.api.endpoints import router as api_router

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Inspector: SVN CSV + Review Checklist (with advanced compare)")

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health():
    logger.info("Health check endpoint called.")
    return {"status": "ok"}
