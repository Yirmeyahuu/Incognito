# 🕶️ Incognito

> Speak freely. Be heard. Stay anonymous.

**Incognito** is a modern web application that allows people to send **anonymous messages** through a unique, shareable link.  
It’s designed not just for fun confessions, but for **honest feedback, suggestions, and civic participation**—without fear or bias.

---

## ✨ Why Incognito?

Not all voices are heard when identities get in the way.

Incognito creates a safe space for:
- 💬 Anonymous feedback
- 🗳️ Election and candidate suggestions
- 📢 Honest opinions
- 🧠 Open communication without judgment

Each user gets a **private inbox**, while anyone with their link can send a message—no login required.

---

## 🚀 Features

### 🔐 Authentication
- Firebase Authentication
- Email & Password Sign Up / Sign In
- Google Sign-In

### 🔗 Shareable Anonymous Inbox
- Each user gets a unique public link
- Anyone can send messages anonymously
- No sender authentication required

### 📥 Private Feed / Dashboard
- View received messages
- Mark as read
- Archive or delete messages
- Enable or disable inbox anytime

### 🌙 Dark & Light Mode
- Dark Mode: `#131313`
- Light Mode: `#f2f2f2`
- Clean, minimal, and modern UI

---

## 🛠️ Tech Stack

### Frontend
- ⚡ Vite + React
- 🧩 TypeScript
- 🎨 Tailwind CSS

### Backend
- 🟢 Node.js
- 🧩 TypeScript
- 🔐 Firebase Admin SDK

### Database & Auth
- 🔥 Firebase Authentication
- 📦 Firestore Database

---

## 📁 Project Structure

```txt
Incognito/
└── incognito-frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   ├── context/
    │   ├── hooks/
    │   ├── types/
    │   └── utils/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
````

> Backend services will be added as the project evolves.

---

## 🧭 User Flow

1. User visits the landing page
2. Signs up or signs in
3. A unique public inbox link is generated
4. User shares the link
5. Anyone can send anonymous messages
6. Messages appear in the user’s private feed

---

## 🔒 Security & Privacy

* No public Firestore writes from the client
* Messages submitted through backend validation
* Rate limiting & abuse prevention planned
* Sender identity is never stored or exposed

---

## 🧪 Project Status

🚧 **In Active Development**

This project is currently in its MVP phase.
Features and structure are expected to evolve.

---

## 🌱 Future Plans

* Message moderation tools
* Analytics for feedback & elections
* Message expiration
* Inbox customization
* Reporting & filtering
* AI-assisted content moderation

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.
Feel free to fork the repository or open an issue.

---

## 📜 License

This project is licensed under the **MIT License**.

---

> **Incognito** — because sometimes, the truth is best spoken without a name.

```

---

If you want, I can:
- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}
- :contentReference[oaicite:3]{index=3}

Just say the word 😌
```
