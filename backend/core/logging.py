import logging


def configure_logging():
    # Basic logging configuration for development
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


logger = logging.getLogger("shopping_mart")
