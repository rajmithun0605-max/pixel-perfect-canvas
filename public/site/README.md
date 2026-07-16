# Chrona — Letters to your future self

Personal time-capsule web app built for the **Frontend Web Development Competition 2026**.
Pure **HTML, CSS, and JavaScript** — no frameworks, no build step, no backend.

## Live
Deploy the `public/site/` folder (or its contents at the root) to Vercel / Netlify / GitHub Pages.

## Features
- **Vertical timeline** of memories with scroll reveals
- **Sealed capsules** with unseal date + countdown
- **Multi-step form** with custom validation
- **Image gallery** slider (keyboard + swipe)
- **Search overlay** (`/` shortcut)
- **Dark / light theme** — respects OS, persists in localStorage
- **Export / import** archive as JSON
- **Hash-based router** with deep-linkable capsules
- **Loading screen**, toasts, modal, print stylesheet
- **Keyboard shortcuts**: `/` search, `N` new, `T` timeline, `H` home, `Esc` close
- Fully **responsive** (mobile → desktop) and `prefers-reduced-motion` aware

## Structure
```
site/
├── index.html
├── assets/          # favicon, images
├── styles/main.css  # tokens, components, pages
└── scripts/
    ├── main.js       # entry
    ├── router.js     # hash router
    ├── storage.js    # localStorage layer
    ├── pages/        # home, timeline, new, about
    ├── ui/           # theme, modal, slider, search, toast
    └── utils/        # dom, date helpers
```

## Deploy to Vercel
1. Push this project to GitHub.
2. Import the repo on Vercel — no build command, output directory `/`.
3. Done.
