# Capshan 🎬

**The free, open-source alternative to Captions.ai and VEED.io**

Create viral-style captions for your videos with AI-powered transcription and stunning text animations. Perfect for TikTok, Instagram Reels, and YouTube Shorts.

![Capshan Preview](https://img.shields.io/badge/Status-Beta-yellow) ![License](https://img.shields.io/badge/License-MIT-blue) ![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB)

---

## ✨ Features

- 🤖 **AI Transcription** - Automatic speech-to-text using Whisper (runs locally)
- 🔥 **Viral Caption Styles** - Hormozi, Aesthetic, and custom presets
- ⚡ **Word-by-Word Highlighting** - Karaoke-style animated captions
- 🎨 **Full Customization** - Fonts, colors, animations, positioning
- 📱 **Multi-Platform Export** - 9:16 (TikTok), 16:9 (YouTube), 1:1 (Instagram)
- 🔒 **100% Private** - Everything runs locally, nothing leaves your device
- 💾 **Export to MP4** - Captions burned directly into video

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- FFmpeg (for video export)

### Installation

```bash
# Clone the repo
git clone https://github.com/rasinmuhammed/capshan.git
cd capshan

# Install frontend dependencies
npm install

# Install backend dependencies (for video export)
cd server && npm install && cd ..

# Start the development server
npm run dev

# In a separate terminal, start the export server
cd server && npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📖 How to Use

1. **Upload** - Drop your video file
2. **Transcribe** - AI generates captions automatically
3. **Style** - Choose a preset or customize your look
4. **Export** - Download video with burned-in captions

---

## 🎨 Caption Styles

| Style | Description |
|-------|-------------|
| **Hormozi** | Bold uppercase, gold highlights, high-energy |
| **Viral** | Pop animation, green accents, TikTok-ready |
| **Aesthetic** | Script fonts, pink emphasis, soft vibes |
| **Custom** | Build your own unique style |

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Framer Motion
- **Styling**: Tailwind CSS
- **Transcription**: Transformers.js (Whisper)
- **Video Processing**: FFmpeg
- **State**: Zustand

---

## 📁 Project Structure

```
capshan/
├── src/
│   ├── components/     # React components
│   ├── store/          # Zustand state management
│   ├── utils/          # Helper functions
│   ├── hooks/          # Custom React hooks
│   └── types/          # TypeScript types
├── server/             # Express backend for video export
└── public/             # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 💖 Support

If you find Capshan useful, consider:
- ⭐ Starring this repo
- ☕ [Buy me a coffee](https://buymeacoffee.com/capshan)

---

**Made with ❤️ for content creators**
