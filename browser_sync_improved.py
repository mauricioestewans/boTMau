#!/usr/bin/env python3
"""Wrapper script to run the main script located in the Uploads/ directory.
This allows running `python browser_sync_improved.py` from the repository root.
"""
import os
import runpy
import sys

ROOT = os.path.dirname(__file__)
TARGET = os.path.join(ROOT, "Uploads", "browser_sync_improved.py")

if __name__ == "__main__":
    if not os.path.exists(TARGET):
        print(f"❌ Arquivo não encontrado: {TARGET}")
        sys.exit(1)
    # Execute the target script as if it were run directly
    runpy.run_path(TARGET, run_name="__main__")
