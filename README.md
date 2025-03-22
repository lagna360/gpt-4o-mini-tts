# lagna360 - GPT-4o-mini-tts Demo

A mobile-friendly, dark-themed web application to showcase OpenAI's GPT-4o-mini-tts API. This app allows users to test various text-to-speech features with a modern, gaming-inspired UI.

## Features

- 🎭 Choose from all 11 OpenAI TTS voices (alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer, verse)
- 🎮 Modern, gaming-inspired dark UI with responsive design
- 🎛️ Adjust speech speed from 0.25x to 4.0x
- 📝 Input custom text (up to 4096 characters) with character count tracking
- 🎯 Add custom voice instructions to personalize the output
- 🎨 10 preset "personalities" with example scripts and instructions
- 🔒 Securely use your own OpenAI API key (stored only in browser's localStorage)
- 📥 Download and share functionality for generated audio
- 💻 Source code display with JavaScript, Python, and cURL examples
- 📊 Complete API request and response visualization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An OpenAI API key with access to the GPT-4o-mini-tts model

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/lagna360/gpt-4o-mini-tts.git
   cd gpt-4o-mini-tts
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter your OpenAI API key (it will be stored only in your browser's local storage)
2. Select a voice from the available options
3. Choose a pre-built vibe or customize your own
4. Enter text in the script area
5. Add custom instructions if desired
6. Adjust the speech speed
7. Click "Generate Speech" to create the audio
8. Listen, download, or share the generated audio

## API Reference

This application uses the OpenAI API's text-to-speech endpoint:

```
POST https://api.openai.com/v1/audio/speech
```

For more information, visit the [OpenAI API documentation](https://platform.openai.com/docs/api-reference).

## Technologies Used

- React
- Vite
- Tailwind CSS
- OpenAI API

## License

MIT

