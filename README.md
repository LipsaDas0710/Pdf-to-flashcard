# Flashcard App

A starter full-stack project with:

- `frontend/`: HTML + Tailwind CSS (CDN) + vanilla JavaScript
- `backend/`: Express API skeleton for flashcard generation

## Project Structure

```
flashcard-app/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── flashcardRoutes.js
│   ├── controllers/
│   │   └── flashcardController.js
│   ├── models/
│   │   └── Flashcard.js
│   └── utils/
│       └── pdfParser.js
├── package.json
└── README.md
```

## Frontend Features

- Dark mode by default
- Gradient background (black to blue/purple)
- Glassmorphism UI
- Landing section with hero + Upload button
- Hidden upload modal with drag-and-drop UI
- Hidden flashcard section shown after PDF upload
- Smooth transitions and hover effects

## Run Backend

```bash
npm install
npm start
```

Server runs on `http://localhost:5000`.
