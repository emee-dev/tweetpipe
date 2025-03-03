# Tweetpipe

A cutting-edge social media growth tool that helps you generate organic posts based on your desktop screen activity. Whether you're coding, teaching, or working on a project, **Tweetpipe** captures key moments and turns them into engaging content for platforms like Twitter and Bluesky.

With **Tweetpipe**, you'll never run out of content ideas again!

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/emee-dev/tweetpipe
cd tweetpipe
```

### 2️⃣ Install **Screenpipe**

**Tweetpipe** relies on [Screenpipe](https://docs.screenpi.pe/docs/getting-started) for screen activity tracking.

1. Install **Screenpipe** → [Installation Guide](https://github.com/mediar-ai/screenpipe)
2. Install and enable the **Pipe SDK** by following the instructions in [`pipe/README.md`](pipe/README.md).

---

## 🖥️ Running the Next.js App

This project is built on **Next.js**, providing a seamless desktop application experience.

1. Install dependencies and run the Electron app:

```bash
# Install dependencies
npm install

# Run the app
npm run dev
```

---

## ✨ Features

- **Automated Content Generation** → Uses a cron job to analyze your screen activity, summarize key insights, and send them to an LLM for post generation.
- **One-Click Sharing** → Easily share your generated posts directly from the app.
