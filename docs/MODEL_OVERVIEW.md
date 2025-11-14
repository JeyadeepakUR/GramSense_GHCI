# **3. `MODEL_OVERVIEW.md`**


This document summarizes the machine learning models used in GramSense, their roles, and how they are deployed.

---

## 1. ASR Model (Module 2)
- Whisper Tiny or Small  
- Converted to ONNX or TFLite  
- Quantized for on-device performance  
- Language coverage: EN, HI, TA  

---

## 2. NER/Intent Model (Module 3)
- DistilBERT multilingual  
- Fine-tuned for:
  - Crop names  
  - Pest mentions  
  - Soil/water conditions  
  - Severity classification  

---

## 3. Risk Forecast Models (Module 6/Backend)
- Prophet or LSTM  
- Time-series drought/pest forecasting  
- Runs in backend (not on device)  

---

## 4. Federated Learning (Module 5)
- Flower/TFF client on device  
- Aggregator server  
- Differential privacy layer  

---

## 5. Model Storage (TODO)
- S3/GCS bucket  
- Versioning strategy  

---

## 6. Future Additions
- Add model cards  
- Add evaluation metrics  
- Add confusion matrices  