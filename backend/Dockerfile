# CIRA backend (F01–F07 API). Build context: repository root (contracts and synthetic fixtures are read at runtime).
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 CIRA_DATA=/data
WORKDIR /cira
COPY backend/pyproject.toml backend/pyproject.toml
# runtime dependencies come from pyproject.toml (single source)
RUN python -c "import tomllib;print('\n'.join(tomllib.load(open('backend/pyproject.toml','rb'))['project']['dependencies']))" > /tmp/req.txt \
 && pip install --no-cache-dir -r /tmp/req.txt
COPY contracts contracts
COPY synthetic_fixtures synthetic_fixtures
COPY backend/app backend/app
WORKDIR /cira/backend
VOLUME ["/data"]
EXPOSE 8000
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=12 \
  CMD python -c "import json,urllib.request;assert json.load(urllib.request.urlopen('http://127.0.0.1:8000/health'))['status']=='ok'"
CMD ["python", "-m", "uvicorn", "--factory", "app.api.main:create_app", "--host", "0.0.0.0", "--port", "8000"]
