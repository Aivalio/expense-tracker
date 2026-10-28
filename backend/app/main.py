""" FastAPI entry point & health check"""
from app.routes.auth import router as auth_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

from app.routes.categories import router as categories_router
from app.routes.expenses import router as expenses_router

# Create the FastAPI App with the settings loaded from the config file
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="REST API for the Expense Tracker App"
)


# CORS (allow the communication and data exchange between Frontend & Backend)
origins = [o.strip() for o in settings.CORS_ORIGIN.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(expenses_router)

@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }