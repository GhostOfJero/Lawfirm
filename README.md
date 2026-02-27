Harmon & Vega Law — Landing Page
California Legal Advocates · GitHub → Vercel Deployment Guide

Project Structure

your-repo/
├── index.html          ← Main landing page
├── styles.css          ← All styles & animations
├── main.js             ← Cursor, scroll, reveal, stat counters, form logic
├── api/
│   └── contact.js      ← Vercel Serverless Function (handles form emails)
├── package.json        ← nodemailer dependency
├── vercel.json         ← Vercel routing config
├── .env.example        ← Safe credentials template (commit this)
├── .gitignore          ← Keeps secrets out of GitHub (commit this)
└── README.md           ← This file

How the Contact Form Works

User fills form → main.js validates fields
       ↓
fetch POST → /api/contact (JSON body)
       ↓
Vercel runs api/contact.js (serverless)
       ↓
Nodemailer sends email via your provider
       ↓
Email lands in EMAIL_TO inbox
       ↓
User sees success message on page

Step 1 — Set Up Your GitHub Repository

If starting fresh
git init
git add .
git commit -m "Initial commit — Harmon & Vega Law site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main

For future updates
git add .
git commit -m "Your update message"
git push
→ Vercel auto-deploys in ~30 seconds ✅

Step 2 — Connect GitHub to Vercel

1. Go to vercel.com and sign up / log in
2. Click "Add New Project"
3. Click "Import Git Repository"
4. Select your GitHub repo
5. Framework Preset: Other (this is a static site + serverless)
6. Root Directory: leave as `/` (default)
7. Click Deploy

Vercel will auto-deploy every time you push to `main`.

Step 3 — Install nodemailer on Vercel

Vercel reads your `package.json` automatically. Since `nodemailer` is listed as a dependency, Vercel will install it during each deployment — you don't need to run `npm install` manually.

Step 4 — Add Environment Variables in Vercel

This is the most important step. Never put real passwords in your code files.

1. Go to your project in the Vercel Dashboard
2. Click Settings → Environment Variables
3. Add the following variables one by one:

 Variable   Description   Example 
--- --- ---
 `EMAIL_SERVICE`   Your email provider   `gmail` 
 `EMAIL_USER`   The address that sends emails   `yourname@gmail.com` 
 `EMAIL_PASS`   Your app password (see below)   `abcd efgh ijkl mnop` 
 `EMAIL_TO`   Where inquiries are delivered   `inquiries@yourfirm.com` 
 `EMAIL_HOST`   SMTP host (only for custom domains)   `smtp.yourdomain.com` 
 `EMAIL_PORT`   SMTP port (only for custom domains)   `587` 

4. Set Environment to: ✅ Production ✅ Preview ✅ Development
5. Click Save
6. Redeploy your project so the new variables take effect:
   Deployments → your latest → ⋯ menu → Redeploy

Step 5 — Get Your Email App Password

Gmail
1. Go to myaccount.google.com
2. Security → enable 2-Step Verification
3. Security → App Passwords → Create one for "Mail"
4. Copy the 16-character password → paste as `EMAIL_PASS` in Vercel
5. Set `EMAIL_SERVICE=gmail`

Outlook / Hotmail
1. Go to account.microsoft.com
2. Security → Advanced security options → App passwords → Create
3. Copy the password → paste as `EMAIL_PASS`
4. Set `EMAIL_SERVICE=hotmail`

Custom Domain Email (G Suite, Zoho, Mailgun, etc.)
1. Get SMTP credentials from your email provider's dashboard
2. Set `EMAIL_SERVICE=smtp`
3. Fill in `EMAIL_HOST` and `EMAIL_PORT` (usually 587)
4. `EMAIL_USER` = your full email address
5. `EMAIL_PASS` = your SMTP password

Step 6 — Test the Contact Form

1. Visit your live Vercel URL
2. Fill in the contact form and submit
3. Check the `EMAIL_TO` inbox for the formatted inquiry email
4. Check Vercel Dashboard → Functions logs if anything goes wrong

Updating the Site

Make your changes locally, then:
git add .
git commit -m "Update attorney photos"
git push
Vercel deploys automatically — live in ~30 seconds

Customising the Form Destination Email

To change where inquiries are sent:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Edit `EMAIL_TO` with your new address
3. Redeploy (Deployments → Redeploy)

No code changes needed.

Local Development (Optional)

Install Vercel CLI
npm install -g vercel

Run locally (reads .env file for credentials)
cp .env.example .env
Edit .env with your real values

vercel dev
→ Site runs at http://localhost:3000
→ /api/contact endpoint works locally too

Troubleshooting

 Problem   Solution 
--- ---
 Form submits but no email arrives   Check Vercel Function logs; verify `EMAIL_PASS` is an App Password not your login password 
 "Server configuration error" message   `EMAIL_USER`, `EMAIL_PASS`, or `EMAIL_TO` env vars are missing in Vercel 
 Gmail "Invalid login" error   Enable 2FA and generate an App Password — regular passwords don't work 
 Form shows network error   Check browser console; confirm `/api/contact` is deploying correctly 
 Vercel build fails   Ensure `package.json` is in root directory and `nodemailer` is listed under `dependencies` 

Support

For questions about the codebase, update the site content by editing:
- Firm info / copy → `index.html`
- Styles / colors → `styles.css`
- Form logic / animations → `main.js`
- Email handler → `api/contact.js`
- Routing / config → `vercel.json`

