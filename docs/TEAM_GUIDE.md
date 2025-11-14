# Team Guide

This guide defines responsibilities, workflows, and rules for the GramSense development team.

---

## 1. Team Roles
### Owner
- ASR, NLU, Sync, Federated Learning  
- Backend, Cloud, DevOps, Security  
- Reviews PRs from Module 1 and 7  

### Module 1 Developer
- Client App (apps/client-app)  
- Offline-first UI  
- Audio recording + TTS  
- IndexedDB  

### Module 7 Developer
- Dashboard (apps/dashboard)  
- Backend API (apps/backend-api)  

---

## 2. Branch Workflow
- `main` = protected; never commit directly  
- `dev` = integration  
- `feature/module1-client` = Newbie A  
- `feature/module7-dashboard-api` = Newbie B  
- `feature/owner-all-core` = your branch  

---

## 3. Pull Request Rules
- All PRs → `dev`  
- Require approval before merge  
- One feature = one branch  
- Small commits preferred  

---

## 4. Coding Standards (Initial)
- Use ESLint for JS  
- Use Black for Python  
- Commit messages:
    ```
    feat: add new feature
    fix: resolve bug
    chore: cleanup
    docs: documentation
    ```

---

## 5. Meeting Protocol
- Weekly check-in  
- Daily Slack/WhatsApp updates  
- No pushing untested code  

---

## 6. TODO
- Add coding style guides  
- Add testing strategy  
- Add deployment instructions 