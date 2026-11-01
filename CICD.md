CI/CD: GitHub Actions та Vercel
Workflow: .github/workflows/vercel.yml.

## Як працює
Push у main або developer, а також pull request до цих гілок запускають Test and build.
Node.js 22 встановлює залежності через npm ci, запускає тести без watch-режиму та production build. CI=true також робить попередження збірки помилками.
Лише після успішних перевірок push запускає Deploy Hook відповідної гілки. Pull request нічого не деплоїть.
Workflow можна запустити вручну через Actions → Frontend CI/CD → Run workflow. Деплой дозволений лише для main і developer.
Налаштування GitHub та Vercel
У Vercel → Project → Settings → Git → Deploy Hooks створи два hooks: один для main, інший для developer. Кожен URL прив'язаний до конкретної гілки.

У GitHub → Settings → Secrets and variables → Actions створи Repository secrets:

## Secret	Значення
VERCEL_DEPLOY_HOOK_MAIN	URL hook для main
VERCEL_DEPLOY_HOOK_DEVELOPER	URL hook для developer
Старий VERCEL_DEPLOY_HOOK більше не використовується. Не додавай URL hooks у файли репозиторію.

У Vercel налаштуй Node.js 22, Install Command npm ci, Build Command npm run build, Output Directory build. Production Branch має бути main.

У Vercel → Settings → Environment Variables додай для відповідних Production/Preview середовищ:

## Змінна	Призначення
REACT_APP_API_BASE_URL	URL backend API, включно з /api
REACT_APP_SUPABASE_URL	URL Supabase проєкту
REACT_APP_SUPABASE_PUBLIC_KEY	Публічний publishable/anon ключ Supabase
Усі REACT_APP_* потрапляють у браузерний bundle. Не використовуй service-role або інші приватні ключі. CI використовує тестові значення без доступу до production; Vercel повторно збирає застосунок зі своїми змінними.

Якщо увімкнені автоматичні Git-деплої Vercel, вони можуть запускатися незалежно від цього workflow. Щоб перевірки були обов'язковими перед деплоєм, налаштуй поведінку Git-деплоїв у Vercel; не встановлюй github.enabled=false, бо це також блокує Deploy Hooks. У GitHub ruleset/branch protection додай Test and build як обов'язкову перевірку перед merge.

Успішний крок Deploy Hook означає, що Vercel прийняв запит. Фінальний статус збірки та публікації перевіряй у Vercel → Deployments. Hook деплоїть поточний стан своєї гілки, тому це не гарантія публікації конкретного SHA перевіреної збірки.

## Перевірка
Відкрий pull request до developer та перевір Test and build у вкладці Actions. Після merge перевір окремий крок деплою та результат у Vercel.

## Документація: GitHub setup-node, Vercel Deploy Hooks.