from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import jwt
from shared.config import settings
from shared.database import tenant_context

class TenantAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/health", "/api/auth/login", "/api/auth/refresh"]:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        tenant_id = None

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
                tenant_id = payload.get("tenant_id")
                # Also inject user info into state if needed
                request.state.user = payload
            except jwt.ExpiredSignatureError:
                return JSONResponse({"detail": "Token has expired"}, status_code=401)
            except jwt.InvalidTokenError:
                return JSONResponse({"detail": "Could not validate credentials"}, status_code=401)
        else:
            return JSONResponse({"detail": "Not authenticated"}, status_code=401)

        if not tenant_id:
            tenant_id = request.headers.get("X-Tenant-ID")

        if not tenant_id:
            return JSONResponse({"detail": "No tenant ID provided"}, status_code=401)

        request.state.tenant_id = tenant_id
        
        token_ctx = tenant_context.set(tenant_id)
        try:
            response = await call_next(request)
            return response
        finally:
            tenant_context.reset(token_ctx)
