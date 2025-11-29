from slowapi import Limiter
from slowapi.util import get_remote_address

# Define global limiter with 50 requests per hour default
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["50/hour"],  # global default
)
