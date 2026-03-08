import os
import sys
from dotenv import load_dotenv

print(f"Python: {sys.version}")
print(f"CWD: {os.getcwd()}")
print(f"PYTHONPATH: {os.environ.get('PYTHONPATH', 'not set')}")

try:
    load_dotenv()
    print("Loaded .env")
    from src.api.main import app
    print("Imported src.api.main:app")
    from src.tasks.worker import celery
    print("Imported src.tasks.worker:celery")
except Exception as e:
    print(f"Error during imports: {e}")
    import traceback
    traceback.print_exc()

print("Debug script finished")
