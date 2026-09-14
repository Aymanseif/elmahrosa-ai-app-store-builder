# Built from the repo root for a consistent build context (pnpm/plain COPY):
#   docker build -f services/ai-generator/Dockerfile .
# requirements.txt is the pip-tools pinned lockfile (generated from
# requirements.in — see milestone 1.6 of the remediation order).

FROM python:3.12-slim

WORKDIR /app

COPY services/ai-generator/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/ai-generator/main.py services/ai-generator/claude.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
