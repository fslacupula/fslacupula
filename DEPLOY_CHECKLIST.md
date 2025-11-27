## 🚀 Despliegue Rápido - Checklist

### ✅ Pre-despliegue (YA ESTÁ LISTO)

- [x] `render.yaml` configurado
- [x] Backend preparado con `DATABASE_URL`
- [x] Frontend configurado con variables de entorno
- [x] `.gitignore` actualizado
- [x] Scripts de inicio listos

### 📝 Pasos que DEBES hacer:

1. **Sube a GitHub**

   ```bash
   git add .
   git commit -m "Preparar para Render"
   git push origin main
   ```

2. **Ve a [render.com](https://render.com)**

   - Regístrate con GitHub

3. **Crea servicios en este orden:**

   #### A. PostgreSQL (5 min)

   - New + → PostgreSQL
   - Name: `futbolclub-db`
   - Plan: Free
   - Create Database
   - ⚠️ **GUARDA** la Internal Database URL

   #### B. Backend (10 min)

   - New + → Web Service
   - Repo: FutbolClub
   - Name: `futbolclub-api`
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=[Pegar URL de paso A]
     JWT_SECRET=cambiar_esto_por_secreto_seguro
     ```
   - Create Service
   - ⚠️ **GUARDA** la URL (ej: https://futbolclub-api.onrender.com)

   #### C. Frontend (5 min)

   - New + → Static Site
   - Repo: FutbolClub
   - Name: `futbolclub-frontend`
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
   - Variable:
     ```
     VITE_API_URL=https://futbolclub-api.onrender.com/api
     ```
   - Create Site

4. **Inicializar BD** (desde Shell del backend en Render)

   ```bash
   psql $DATABASE_URL < database/schema.sql
   ```

5. **¡Listo!** 🎉
   - Frontend: https://futbolclub-frontend.onrender.com
   - API: https://futbolclub-api.onrender.com

---

### ⚠️ IMPORTANTE

- Primera carga del backend: ~30 segundos (se estaba durmiendo)
- Actualizar: Solo haz `git push` → autodeploy automático
- Ver logs: Dashboard de Render → Ver cada servicio

### 📖 Guía completa

Lee `DEPLOY_RENDER.md` para detalles completos y troubleshooting
