# GramSense Architecture Overview

This document describes the high-level architecture of the GramSense system, including client-side components, backend services, ML pipelines, and deployment layers.

---

## 1. System Overview (To Be Expanded)
- Offline-first voice capture on mobile/PWA  
- On-device ASR using Tiny/Small Whisper models  
- On-device NLU using distilled BERT  
- Encrypted local storage + sync queue  
- Cloud ingestion backend  
- Analytics dashboard  
- Federated learning server  

---

## 2. Major Components
### 2.1 Client Application (Module 1)
- PWA with offline-first UX  
- Audio recording  
- IndexedDB / SQLite storage  
- Language toggle and TTS  

### 2.2 ASR Engine (Module 2)
- Whisper Tiny/TFLite  
- VAD preprocessing  
- Quantized model runtime  

### 2.3 NLU Pipeline (Module 3)
- DistilBERT-based entity extraction  
- Domain-specific dictionaries  
- Structured output  

### 2.4 Storage + Sync (Module 4)
- Encrypted SQLite  
- Delta sync strategy  
- Retry queue  

### 2.5 Federated Learning (Module 5)
- Flower / TFF  
- Differential privacy  
- Secure aggregation  

### 2.6 Cloud Ingest + Analytics (Module 6)
- FastAPI backend  
- Data lake storage  
- Kafka or event streams  
- Model serving layer  

### 2.7 Dashboard (Module 7)
- React dashboard  
- Leaflet maps  
- Chart.js analytics  

### 2.8 Security Layer (Module 8)
- Consent flow  
- AES-256 encryption  
- Audit logging  

### 2.9 DevOps & Monitoring (Module 9)
- Docker containers  
- GitHub Actions pipelines  
- Prometheus + Grafana  

---

## 3. Data Flow Diagram (TODO)
- Voice → ASR → NLU → Structured record  
- Local DB → Sync queue → Cloud API  
- Cloud backend → Dashboard visualizations  

(*To be added later with a diagram*)

---

## 4. Deployment Architecture (TODO)
- Dev environment  
- Production environment  
- Cloud buckets / DBs  

---

## 5. Future Notes
- Add sequence diagrams  
- Add component diagrams  
- Add deployment diagrams