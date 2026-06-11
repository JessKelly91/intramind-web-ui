"""Test configuration: make the backend package importable.

These tests deliberately exercise the auth / tenancy / rate-limit modules in
isolation, without importing the FastAPI routers (which pull in the heavy AI
Agent stack). A minimal app is constructed per test for dependency coverage.
"""

import os
import sys

# Put the backend directory (one level up) on sys.path so `config`, `auth`,
# and `tenancy` import the same way they do at runtime.
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
