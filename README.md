# TruthVerify: AI-Powered Content Verification Browser Extension

A browser extension that leverages AI and decentralized identity technology to combat online misinformation. The solution integrates cheqd's verifiable credentials with deep learning models to analyze content authenticity in real-time while providing users with transparent trust scoring.

## Our Vision

In an era where digital content is increasingly manipulated and misinformation spreads at unprecedented speed, TruthVerify envisions a web where users can confidently discern fact from fiction. We aim to establish a new standard for online trust through the seamless integration of cutting-edge AI and decentralized identity technology.

## Mission

TruthVerify's mission is to empower internet users with real-time, transparent verification of digital content across the web. By combining advanced deep learning analysis with decentralized identity verification, we provide users with the tools to make informed decisions about the content they consume.

## Core Values

- **Truth**: We are committed to promoting factual information and revealing manipulated content.
- **Transparency**: All verification processes and trust scores are explainable and transparent to users.
- **Privacy**: Content analysis happens locally within the browser, respecting user privacy.
- **Innovation**: We continuously improve our detection capabilities as manipulation techniques evolve.
- **Accessibility**: Trust verification should be available to everyone, integrated seamlessly into daily browsing.

## Features

- Real-time deepfake detection using TensorFlow.js
- NLP-based misinformation detection
- Decentralized credential verification using cheqd
- Dynamic trust scoring system
- Visual feedback on content authenticity

## Project Architecture

The extension employs a multi-layered architecture combining client-side content analysis with decentralized credential verification:

1. **Content Analysis Engine**: Uses computer vision and NLP models to detect deepfakes and suspicious textual patterns
2. **Credential Verification Layer**: Interfaces with cheqd's network to validate source credentials
3. **Trust Scoring System**: Synthesizes signals from multiple verification sources into actionable insights

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/amtheli/TruthVerify.git
cd TruthVerify

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

The extension will be built in the `dist` directory.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `dist` directory

## License

MIT 