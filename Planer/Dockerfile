# Offizielles, leichtes Python-Image nutzen
FROM python:3.11-slim

# Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Den restlichen Code kopieren
COPY . .

# Port dokumentieren 80 statt 5000
EXPOSE 80

# Startbefehl festlegen
CMD ["python", "app.py"]