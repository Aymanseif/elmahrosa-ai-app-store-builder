FROM python:3.12-slim

WORKDIR /app

# requirements.txt is the pip-tools pinned lockfile (generated from
# requirements.in — see milestone 1.6 of the remediation order).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py claude.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
