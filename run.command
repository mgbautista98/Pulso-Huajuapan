#!/bin/sh
cd "$(dirname "$0")" || exit 1
if [ ! -d .venv ]; then python3 -m venv .venv; fi
. .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
