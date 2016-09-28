#!/bin/bash
gunicorn app:app -D
python worker.py
