# Χρησιμοποιούμε επίσημη εικόνα Python
FROM python:3.12-slim

# Ορίζουμε το working directory μέσα στο container
WORKDIR /app

# Εγκατάσταση απαραιτήτων εργαλείων συστήματος αν χρειαστεί
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Αντιγραφή και εγκατάσταση των dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Αντιγραφή του υπόλοιπου κώδικα του backend
COPY . .

# Άνοιγμα της πόρτας 8001
EXPOSE 8001

# Εκκίνηση του FastAPI με uvicorn δείχνοντας στον φάκελο app.main
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]