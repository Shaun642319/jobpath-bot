# JobPath Bot — AI-Powered Career Assistant

JobPath Bot is a web-based AI career assistant designed to help students, graduates, and job seekers with career-related questions, interview preparation, CV writing, and professional development.

Built with **Node.js, Express.js, JavaScript, and Google's Gemini API**, the application combines conversational AI with a guided CV builder and automated PDF generation.

## Project Overview

JobPath Bot was developed to explore how generative AI can be integrated into a practical web application.

The chatbot focuses on employment-related assistance rather than general-purpose conversations. Users can ask career questions, receive AI-generated guidance, and create a CV through a structured, interactive workflow.

The project demonstrates frontend and backend development, REST API integration, prompt engineering, structured data handling, and document generation.

## Features

### AI Career Chatbot
- AI-generated career guidance powered by Gemini 2.5 Flash
- Interview preparation and job search advice
- CV and cover letter writing guidance
- Salary negotiation and remote work discussions
- Career-focused prompt instructions
- Limited conversation context using recent user messages

### Interactive CV Builder
- Guided, step-by-step CV information collection
- Structured JSON representation of CV data
- Collection of personal details, skills, work experience, education, and projects
- AI-assisted rewriting of CV content
- Automated PDF generation from an HTML template
- Downloadable CV document

### User Interface
- Interactive chat interface
- Light and dark mode
- Quick-reply buttons
- Typing indicators
- Automatic chat scrolling
- Browser-based storage of recent user messages and theme preference

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript | Application logic and frontend interactions |
| HTML5 & CSS3 | Web interface and styling |
| Node.js | Server-side runtime |
| Express.js | Backend API and static file serving |
| Google Gemini 2.5 Flash | AI-powered responses and CV enhancement |
| Google GenAI SDK | Gemini API integration |
| Puppeteer Core | PDF generation |
| Sparticuz Chromium | Headless Chromium runtime |
| dotenv | Environment variable configuration |
| JSON | Structured CV data |

## Application Architecture

The application uses a client-server architecture.

**Career Chat Workflow**

1. The user submits a message through the web interface.
2. The frontend sends the message and recent user-message context to the `/chat` endpoint.
3. The Express backend constructs a career-focused prompt.
4. Gemini 2.5 Flash generates a response.
5. The response is returned to the frontend and displayed in the chat interface.

**CV Generation Workflow**

1. The user selects **Build CV**.
2. The chatbot collects CV details through a sequence of questions.
3. The frontend stores the responses in a structured JavaScript object.
4. The collected information is submitted to `/enhance-cv`.
5. Gemini attempts to improve the wording while retaining the original JSON structure.
6. The resulting CV data is sent to `/generate-cv`.
7. The backend populates an HTML template and generates a PDF using Puppeteer and Chromium.

AI-generated CV content should be reviewed for accuracy before professional use.

## Project Structure

```text
jobpath-bot/
├── public/
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── favicon.ico
├── templates/
│   └── cv-template.html
├── server.js
├── package.json
├── package-lock.json
└── .env.example
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Shaun642319/jobpath-bot.git
cd jobpath-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file using `.env.example` as a reference.

The backend expects:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
```

Never commit real API keys or `.env` files to version control.

### 4. Configure Node.js modules

The server uses ES module syntax. Ensure `package.json` contains:

```json
{
  "type": "module"
}
```

Also add a start script:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

These settings must be incorporated into the existing `package.json`, preserving its dependencies.

### 5. Run the application

```bash
npm start
```

Open:

`http://localhost:5001`

The application uses port 5001 by default unless another port is configured.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/intro` | Returns the chatbot introduction |
| POST | `/chat` | Generates career-related AI responses |
| POST | `/enhance-cv` | Enhances structured CV content using Gemini |
| POST | `/generate-cv` | Generates a downloadable PDF from CV data |

## Key Learning Outcomes

Developing JobPath Bot provided practical experience in:

- Building REST APIs using Express.js
- Integrating large language models into web applications
- Designing prompt instructions for domain-specific AI assistance
- Managing asynchronous frontend-backend communication
- Creating guided conversational workflows
- Processing structured JSON data
- Generating PDFs programmatically
- Handling environment variables and API configuration

## Current Limitations

JobPath Bot is an academic prototype rather than a production-ready career platform.

Current limitations include:

- AI-generated advice may be inaccurate or incomplete.
- Conversation context is limited to recent user messages stored in the browser.
- CV collection follows a predefined question sequence.
- CV enhancement requires user review to prevent factual inaccuracies.
- Input validation, HTML sanitization, and error handling require further improvements.
- The application depends on external Gemini API availability.

## Future Improvements

- Additional CV templates and customization
- Automated cover letter generation
- More robust conversation history management
- Improved input validation and application security
- Expanded CV editing capabilities
- Multilingual career assistance
- Automated testing and deployment improvements

## Project Background

JobPath Bot was developed in 2025 as part of an Introduction to Artificial Intelligence group project at Asia Pacific University of Technology & Innovation (APU).

My primary contributions included developing the functional chatbot application, preparing the demonstration, and documenting testing and analysis.

The project provided an opportunity to apply AI integration concepts to a functional, career-focused web application.

## Project Status

**Completed academic prototype — further improvements planned**

## Repository

[GitHub — JobPath Bot](https://github.com/Shaun642319/jobpath-bot)
