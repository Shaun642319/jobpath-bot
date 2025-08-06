import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ 1. Intro message endpoint
app.get("/intro", (req, res) => {
  res.json({
    intro:
      "Hi there! I'm <strong>JobPath Bot</strong> — your assistant for all things career. Ask me anything about job searching, CVs, interviews, or remote work!",
  });
});

// ✅ 2. Normal chat with Gemini (modified to include userContext)
app.post("/chat", async (req, res) => {
  const { userMessage, userContext } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // Combine userContext into a single string for Gemini
    const contextText = Array.isArray(userContext) && userContext.length
      ? `Here are the user's recent messages for context:\n${userContext.join("\n")}\n\n`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "model",
          parts: [
            {
              text: `You are JobPath Bot — a friendly, smart, and helpful career assistant.
You ONLY respond to topics related to:
- Job search advice
- Writing CVs or resumes
- Cover letters
- Interview tips
- Salary negotiation
- Remote jobs
- Freelancing
- Upskilling and career growth
- Productivity and motivation during job searching

If the user greets you casually by saying "hi", "hello", or "hey", reply warmly with:
"Hi there! I'm JobPath Bot — your assistant for all things career. Ask me anything about job searching, CVs, interviews, or remote work!"

If the user asks something unrelated to careers, say:
"I'm here to help you with career and job-related queries. Could you ask something relevant to that?"

${contextText}The user’s current message is:`,
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    });

    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I didn't understand that.";
    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err.message || err);
    res.status(500).json({ error: "Failed to get response from Gemini" });
  }
});

// ✅ 3. Enhance CV JSON via Gemini (unchanged)
app.post("/enhance-cv", async (req, res) => {
  const cvData = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "model",
          parts: [
            {
              text: `You are a professional CV/Resume writer and enhancement assistant.
Your task:
- Rewrite and enhance the CV content to sound professional, impactful, and achievement-oriented.
- Use strong action verbs and focus on quantifiable results where possible.
- Maintain the exact same JSON structure and keys as provided.
- Only modify the text values. Do not remove any fields, and do not add new fields.

Return the enhanced CV as JSON only, without any explanations or formatting like markdown.

Example improvements:
- "Worked on projects" → "Led cross-functional projects, improving team efficiency by 30%"
- "Made a website" → "Developed and deployed a responsive web application serving 5,000 users"

Here is the CV JSON to enhance:`,
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: JSON.stringify(cvData) }],
        },
      ],
    });

    const enhancedText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let enhancedCV;

    try {
      enhancedCV = JSON.parse(enhancedText);
    } catch (e) {
      enhancedCV = cvData; // fallback if parsing fails
    }

    res.json({ enhancedCV });
  } catch (err) {
    console.error("Gemini error:", err.message || err);
    res.status(500).json({ error: "Failed to enhance CV" });
  }
});

// ✅ 4. Generate CV PDF (unchanged)
app.post("/generate-cv", async (req, res) => {
  const cvData = req.body;

  try {
    const templatePath = path.join(__dirname, "templates", "cv-template.html");
    const template = fs.readFileSync(templatePath, "utf8");

    // Fill template placeholders
    const html = template
      .replace(/{{fullName}}/g, cvData.personalInfo.fullName || "")
      .replace(/{{email}}/g, cvData.personalInfo.email || "")
      .replace(/{{phone}}/g, cvData.personalInfo.phone || "")
      .replace(/{{address}}/g, cvData.personalInfo.address || "")
      .replace(/{{linkedin}}/g, cvData.personalInfo.linkedin || "")
      .replace(/{{portfolio}}/g, cvData.personalInfo.portfolio || "")
      .replace(/{{summary}}/g, cvData.summary || "")
      .replace(
        /{{skills}}/g,
        (cvData.skills || []).map((s) => `<li>${s}</li>`).join("")
      )
      .replace(
        /{{experience}}/g,
        (cvData.experience || [])
          .map(
            (exp) => `
            <p><strong>${exp.jobTitle}</strong> at ${exp.company} (${exp.startDate} - ${exp.endDate})</p>
            <p>${exp.description}</p>
          `
          )
          .join("")
      )
      .replace(
        /{{education}}/g,
        (cvData.education || [])
          .map(
            (edu) =>
              `<p>${edu.degree} - ${edu.institution} (${edu.startDate} - ${edu.endDate})</p>`
          )
          .join("")
      )
      .replace(
        /{{projects}}/g,
        (cvData.projects || [])
          .map(
            (proj) => `
            <p><strong>${proj.name}</strong>: ${proj.description}</p>
            <p><em>Tech Stack:</em> ${(proj.techStack || []).join(", ")}</p>
          `
          )
          .join("")
      );

    // Generate PDF
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="cv.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Generate CV error:", err.message || err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello from JobPath Bot!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
