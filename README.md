# GramSense – Offline AI for Rural Field Intelligence  
GramSense is a modular system that captures multilingual voice reports from rural field workers, processes them using on-device AI models, securely syncs structured insights to the cloud, and provides real-time dashboards for agriculture, climate resilience, and community monitoring.

This repository follows a multi-module monorepo structure that enables parallel development across frontend, backend, ML, and DevOps components.

---

## 📦 Repository Structure

```
gramsense/
├── apps/
│   ├── client-app/       # Module 1: Offline PWA for voice capture
│   ├── dashboard/        # Module 7: React dashboard for analytics
│   └── backend-api/      # Module 6 & 7 API: FastAPI backend
│
├── ml/
│   ├── asr-engine/       # Module 2: Whisper Tiny/TFLite ASR
│   ├── nlu-engine/       # Module 3: DistilBERT NER + structuring
│   ├── federated-client/ # Module 5: Federated learning client
│   └── federated-server/ # Module 5: Federated learning aggregator
│
├── infra/
│   ├── storage/          # Module 4: Local encrypted DB + sync queue
│   └── devops/           # Module 9: Docker, CI/CD, monitoring
│
├── security/             # Module 8: Privacy, encryption & audit logs
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API_CONTRACT.md
    ├── MODEL_OVERVIEW.md
    ├── TEAM_GUIDE.md
    └── DEPLOYMENT_GUIDE.md
```

---

## 🚀 Project Modules & Responsibilities

### **Module 1 – Client App (PWA)**
- Offline-first PWA  
- Multilingual UI (EN/HI/TA)  
- Audio recorder + STT + TTS  
- IndexedDB encrypted storage  
- Capacitor support for Android build  

### **Module 2 – On-Device ASR Engine**
- Whisper Tiny/Small ONNX/TFLite  
- Quantized inference  
- VAD preprocessing  
- Secure encrypted fallback upload  

### **Module 3 – NLU + Knowledge Extractor**
- Multilingual NER  
- Crop/issue/severity extraction  
- Domain dictionaries  

### **Module 4 – Local Storage + Sync Queue**
- Encrypted SQLite  
- Delta sync  
- HTTPS with certificate pinning  

### **Module 5 – Federated Learning**
- Flower/TFF client  
- Secure aggregation  
- Differential privacy  

### **Module 6 – Cloud Ingest + Analytics**
- FastAPI backend  
- S3/GCS ingestion  
- Kafka pipelines  
- ML inference with Triton/KFServing  

### **Module 7 – Dashboard**
- React-based admin panel  
- Leaflet.js maps  
- Chart.js analytics  
- CSV & PDF export  
- Role-based login  

### **Module 8 – Privacy, Security & Audit**
- Consent flows  
- Encrypted logs  
- Bias monitoring  

### **Module 9 – CI/CD & Monitoring**
- Docker  
- GitHub Actions  
- Prometheus + Grafana  
- ELK stack logging  

---

## 🧑‍💻 Branch Workflow & Naming Convention

### Main branches
```
main → stable, production-ready
dev → integration branch
```

### Feature branches
Use this format:
```
feature/module-<number>-<task>
```

Examples:
```
feature/module1-recorder-ui
feature/module7-backend-auth
feature/module3-ner-dictionaries
```
## 🧭 Git Basics – How to Move Between Branches

### 1. Check which branch you are currently on
```git branch```

You will see something like:
```
*main
dev
feature/module1-recorder-ui
```
The `*` indicates your current branch.

---

### 2. Switch to the `dev` branch (always do this before creating a new branch)
```git checkout dev```

If `dev` doesn’t exist locally:
```git checkout -b dev origin/dev```

---

### 3. Pull the latest updates
```git pull origin dev```

This ensures your feature branch starts from the latest code.

---

### 4. Create your feature branch FROM dev
Use the naming format:
```feature/module-<number>-<task>```

Example:
```git checkout -b feature/module1-recorder-ui```

This creates AND switches you to the new branch.

---

### 5. Make changes → add → commit
```
git add .
git commit -m "feat: recorder UI basic layout"
```
---

### 6. Push your branch to GitHub for the first time
```git push -u origin feature/module1-recorder-ui```

`-u` sets up tracking so next time you can just do:
```git push```

---

### 7. Switch back to another branch (e.g., dev)
```git checkout dev```

---

### 8. Update your branch later (VERY important)
Before continuing work next day:
```
git checkout dev
git pull origin dev
git checkout feature/module1-recorder-ui
git merge dev
```
This keeps your branch updated with team progress.

---

### 9. Open Pull Request
Go to GitHub → your branch → “Open Pull Request” → set **target** to `dev`.

DO NOT target `main`.

---

### Golden Rules
- Never commit directly to `main`.  
- Always branch off from `dev`.  
- Always pull before starting new work.  
- Name branches cleanly and consistently.
  
---

### Workflow
1. `git checkout -b feature/moduleX-task` from `dev`
2. Commit frequently  
3. Push and open PR into `dev`  
4. After review → merge `dev` into `main`  

---

## 🛠 Setup Instructions (Local Development)

### **Client App (PWA)**
```
cd apps/client-app
npm install
npm start
```

### **Dashboard**
```
cd apps/dashboard
npm install
npm start
```

### **Backend API**
```
cd apps/backend-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

FastAPI documentation available at:
```
http://localhost:8000/docs
```

---

## 🔐 Environment Variables

Create `.env` inside `apps/backend-api/`:
```
SECRET_KEY=your-secret-key
DB_URL=sqlite:///./data.db
S3_BUCKET=
```

Add more secrets as required for cloud deploy.

---

## 📦 Deployment Targets

### Client App (PWA)
- Vercel / Netlify

### Backend (FastAPI)
- Render / Railway / AWS / Azure / GCP

### ML Models (Optional)
- NVIDIA Triton Server
- HuggingFace Endpoints (prototype)

---

## 📄 Documentation Index

All detailed docs are in `/docs/`:

- **ARCHITECTURE.md** – system architecture & module interactions  
- **API_CONTRACT.md** – backend API specification  
- **MODEL_OVERVIEW.md** – ML model structures  
- **TEAM_GUIDE.md** – responsibilities & rules  
- **DEPLOYMENT_GUIDE.md** – deployment steps  

---

## 👥 Suggested Team Assignments

| Module | Owner               | Branch Prefix     |
|--------|---------------------|-------------------|
| 1      | Client UI Dev       | module1-*         |
| 2      | ASR Engineer        | module2-*         |
| 3      | NLU Engineer        | module3-*         |
| 4      | Storage/Sync Dev    | module4-*         |
| 5      | Federated Learning Dev | module5-*      |
| 6      | Cloud/Backend Engineer | module6-*      |
| 7      | Dashboard Engineer  | module7-*         |
| 8      | Security Engineer   | module8-*         |
| 9      | DevOps Engineer     | module9-*         |

---

## 📬 Support
See `docs/TEAM_GUIDE.md` for onboarding, style guides, and workflow rules.
