from typing import Optional, Type, Any
import logging
from datetime import datetime
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DatabaseError(Exception):
    """Base exception for all database-related errors"""
    def __init__(self, message: str, original_error: Optional[Exception] = None):
        super().__init__(message)
        self.original_error = original_error
        self.timestamp = datetime.utcnow()


class ConnectionError(DatabaseError):
    """Raised when unable to connect to the database"""
    pass

class QueryError(DatabaseError):
    """Raised when there's an error executing a query"""
    pass

class RecordNotFoundError(DatabaseError):
    """Raised when a record is not found"""
    pass

class DuplicateRecordError(DatabaseError):
    """Raised when attempting to create a duplicate record"""
    pass

class TransactionError(DatabaseError):
    """Raised when there's an error during a transaction"""
    pass

def map_database_error(error: Exception) -> DatabaseError:
    """
    Maps various database-specific errors to our custom exceptions.
    Add mappings for your specific database library (e.g., asyncpg, sqlite3, etc.)
    """
    error_str = str(error).lower()
    
    if "connection" in error_str:
        return ConnectionError("Failed to connect to database", error)
    elif "duplicate" in error_str or "unique constraint" in error_str:
        return DuplicateRecordError("Record already exists", error)
    elif "not found" in error_str:
        return RecordNotFoundError("Record not found", error)
    elif "transaction" in error_str:
        return TransactionError("Transaction failed", error)
    else:
        return QueryError(f"Database query failed: {str(error)}", error)

def handle_database_errors(logger_name: Optional[str] = None):
    """
    Decorator for handling database operations and their errors.
    
    Args:
        logger_name: Optional name for the logger. If not provided, uses the module logger.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_logger = logging.getLogger(logger_name) if logger_name else logger
            
            try:
                return await func(*args, **kwargs)
                
            except DatabaseError as e:
                current_logger.error(
                    f"Database error in {func.__name__}",
                    extra={
                        "error_type": type(e).__name__,
                        "error_message": str(e),
                        "timestamp": e.timestamp,
                        "function": func.__name__,
                        "args": args,
                        "kwargs": kwargs
                    },
                    exc_info=True
                )
                raise
                
            except Exception as e:
                mapped_error = map_database_error(e)
                current_logger.error(
                    f"Mapped database error in {func.__name__}",
                    extra={
                        "error_type": type(mapped_error).__name__,
                        "original_error": str(e),
                        "error_message": str(mapped_error),
                        "timestamp": mapped_error.timestamp,
                        "function": func.__name__,
                        "args": args,
                        "kwargs": kwargs
                    },
                    exc_info=True
                )
                raise mapped_error
                
        return wrapper
    return decorator
