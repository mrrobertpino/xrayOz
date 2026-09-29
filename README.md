# xrayOz 🩻
**See Through the Web.**

Static browser-only HTML/CSS/JS inspection app for classroom use.

## Deploy to GitHub Pages
1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, `app.js`, and `oz.jpg` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. GitHub will provide the Pages address after deployment.

No backend, accounts, database, API keys, or build process are required.

## Safety
Uploaded HTML is read locally with FileReader. The preview runs in a sandboxed iframe with scripts allowed but without same-origin access to the parent app. Preview links are intercepted for inspection.
