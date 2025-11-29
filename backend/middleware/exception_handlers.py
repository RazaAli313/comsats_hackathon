from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from ..core.logging import logger


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning("HTTP error: %s %s", request.method, request.url)
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error: %s %s %s", request.method, request.url, exc)
    return JSONResponse({"detail": exc.errors()}, status_code=422)


async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception while handling request %s %s", request.method, request.url)
    return JSONResponse({"detail": "Internal server error"}, status_code=500)
