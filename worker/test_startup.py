try:
    print("Testing imports...")
    import os
    import sys
    # Add current directory to path
    sys.path.append(os.getcwd())
    
    print("Importing src.api.main...")
    import src.api.main
    print("Import successful!")
    
    print("Checking app...")
    from src.api.main import app
    print("App found!")
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
