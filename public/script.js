const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");
const darkModeToggle = document.getElementById("darkModeToggle");
let chatHistory = [];
let isCvMode = false;
let cvStep = 0;

// ✅ Full JSON template for CV
window.cvData = { 
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    portfolio: ""
  },
  summary: "",
  skills: [],
  experience: [
    {
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      description: ""
    }
  ],
  education: [
    {
      degree: "",
      institution: "",
      startDate: "",
      endDate: ""
    }
  ],
  projects: [
    {
      name: "",
      description: "",
      techStack: []
    }
  ]
};

// ✅ CV Questions (step-by-step)
const cvQuestions = [
  "Let's start building your CV! What's your full name?",
  "What's your email address?",
  "What's your phone number?",
  "What's your address?",
  "Share your LinkedIn profile URL (or type 'skip').",
  "Share your portfolio/website (or type 'skip').",
  "Write a short professional summary about yourself (2-3 sentences).",
  "List your key skills (comma-separated).",
  "What's your most recent job title?",
  "Which company did/do you work for?",
  "Job start date (Month/Year)?",
  "Job end date (or type 'Present').",
  "Describe your role & key achievements in this job.",
  "What's your highest degree or qualification?",
  "Which institution/university did you study at?",
  "Education start year?",
  "Education end year (or expected)?",
  "Tell me about a project: name, short description, and tech stack used."
];

// ✅ Format bot reply for markdown-like effects
function formatBotReply(text) {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>")
    .replace(/(\*|_)(.*?)\1/g, "<em>$2</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>")
    .replace(/\*(.*?)<br>/g, "• $1<br>");
}

// ✅ Append messages to chat
function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerHTML = text;
  chatBox.appendChild(div);
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
}

// ✅ Handle sending a normal or CV message
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
  chatHistory.push({ role: "user", text: message });
  input.value = "";

  if (isCvMode) {
    handleCVInput(message);
    return;
  }

  // Show typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.id = "typing";
  typingDiv.textContent = "JobPath Bot is typing...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: message, history: chatHistory }),
    });

    const data = await res.json();
    const typingDiv = document.getElementById("typing");
    if (typingDiv) typingDiv.remove();

    appendMessage("bot", formatBotReply(data.reply));
    chatHistory.push({ role: "bot", text: data.reply });

  } catch (err) {
    if (typingDiv) typingDiv.remove();
    appendMessage("bot", "⚠️ Failed to get response.");
  }
}

// ✅ CV Input Handler
function handleCVInput(userInput) {
  // Save input to JSON based on step
  switch (cvStep) {
    case 0: window.cvData.personalInfo.fullName = userInput; break;
    case 1: window.cvData.personalInfo.email = userInput; break;
    case 2: window.cvData.personalInfo.phone = userInput; break;
    case 3: window.cvData.personalInfo.address = userInput; break;
    case 4: if(userInput.toLowerCase()!=="skip") window.cvData.personalInfo.linkedin = userInput; break;
    case 5: if(userInput.toLowerCase()!=="skip") window.cvData.personalInfo.portfolio = userInput; break;
    case 6: window.cvData.summary = userInput; break;
    case 7: window.cvData.skills = userInput.split(",").map(s => s.trim()); break;
    case 8: window.cvData.experience[0].jobTitle = userInput; break;
    case 9: window.cvData.experience[0].company = userInput; break;
    case 10: window.cvData.experience[0].startDate = userInput; break;
    case 11: window.cvData.experience[0].endDate = userInput; break;
    case 12: window.cvData.experience[0].description = userInput; break;
    case 13: window.cvData.education[0].degree = userInput; break;
    case 14: window.cvData.education[0].institution = userInput; break;
    case 15: window.cvData.education[0].startDate = userInput; break;
    case 16: window.cvData.education[0].endDate = userInput; break;
    case 17:
      const [name, desc, ...stack] = userInput.split(",");
      window.cvData.projects[0].name = name?.trim() || "";
      window.cvData.projects[0].description = desc?.trim() || "";
      window.cvData.projects[0].techStack = stack.map(s => s.trim());
      break;
  }

  cvStep++;

  if (cvStep < cvQuestions.length) {
    appendMessage("bot", cvQuestions[cvStep]);
  } else {
    appendMessage("bot", "✅ CV data collected! Enhancing it now...");
    isCvMode = false;
    sendCVToGemini(window.cvData);
  }
}

// ✅ Send CV to backend for enhancement
async function sendCVToGemini(cvData) {
  const res = await fetch("/enhance-cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cvData)
  });

  const enhanced = await res.json();
  window.cvData = enhanced.enhancedCV || cvData;

  appendMessage("bot", "Your CV has been enhanced! Click below to download:");
  const btn = document.createElement("button");
  btn.textContent = "📄 Download CV";
  btn.onclick = generatePDF;
  btn.style.marginTop = "10px";
  btn.style.padding = "10px 16px";
  btn.style.backgroundColor = "#007bff";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.borderRadius = "5px";
  btn.style.cursor = "pointer";

  const btnWrapper = document.createElement("div");
  btnWrapper.className = "message bot";
  btnWrapper.appendChild(btn);
  chatBox.appendChild(btnWrapper);
}

// ✅ Generate PDF
function generatePDF() {
  fetch("/generate-cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(window.cvData),
  })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv.pdf";
      a.click();
    });
}

// ✅ Dark mode toggle
function darkMode(forceState) {
  const body = document.body;
  let isDarkMode;

  if (typeof forceState === "boolean") {
    isDarkMode = forceState;
  } else {
    isDarkMode = !body.classList.contains("dark-mode");
  }

  if (isDarkMode) {
    body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  } else {
    body.classList.remove("dark-mode");
    darkModeToggle.checked = false;
  }

  localStorage.setItem("darkMode", isDarkMode);
}


// ✅ Quick reply support
function sendQuick(quickMessage) {
  input.value = quickMessage;
  document.querySelector(".quick-replies").style.display = "none";
  sendMessage();
}

darkModeToggle.addEventListener("change", () => {
  darkMode(darkModeToggle.checked);
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ✅ Intro message
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/intro");
  const data = await res.json();
  appendMessage("bot", formatBotReply(data.intro));

  // Restore dark mode state
  const savedMode = localStorage.getItem("darkMode") === "true";
  darkMode(savedMode)
});

// ✅ CV Builder Button
document.getElementById("cvBuilderBtn").addEventListener("click", () => {
  isCvMode = true;
  cvStep = 0;
  appendMessage("bot", cvQuestions[cvStep]);
});
