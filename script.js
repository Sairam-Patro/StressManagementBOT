// DOM Elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const burgerMenu = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyDRaVJAIzdpuvms242NBB9ZX3aycYLsxVw"; // Replace with your actual key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Initial bot messages
const initialMessages = [
  "Hi there! I'm MindfulChat, your mental wellness companion. How are you feeling today?",
  "You can share your thoughts or concerns with me, and I'll do my best to provide support and guidance."
];

// Add event listeners
document.addEventListener('DOMContentLoaded', initializeChat);
chatForm.addEventListener('submit', handleChatSubmit);
burgerMenu.addEventListener('click', toggleMobileMenu);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: 'smooth'
      });
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    }
  });
});

// Initialize chat
function initializeChat() {
  setTimeout(() => {
    addMessage(initialMessages[0], 'bot');
    setTimeout(() => {
      addMessage(initialMessages[1], 'bot');
    }, 1500);
  }, 800);
}

// Toggle mobile menu
function toggleMobileMenu() {
  navLinks.classList.toggle('active');
}

// Handle chat form submission
async function handleChatSubmit(e) {
  e.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, 'user');
  userInput.value = '';
  showTypingIndicator();

  try {
    const response = await getGeminiResponse(userMessage);
    hideTypingIndicator();

    setTimeout(() => {
      if (response) {
        addMessage(response, 'bot');
      } else {
        addMessage("I'm sorry, I couldn't process your request. Please try again.", 'bot');
      }
    }, 500);
  } catch (error) {
    console.error('Error getting response:', error);
    hideTypingIndicator();
    setTimeout(() => {
      addMessage("I'm having trouble connecting right now. Please try again in a moment.", 'bot');
    }, 500);
  }
}

// Add a message to the chat
function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', sender);

  const textDiv = document.createElement('div');
  textDiv.classList.add('message-text');

  const formattedText = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('<br>');

  textDiv.innerHTML = formattedText;
  messageDiv.appendChild(textDiv);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    messageDiv.classList.add('show');
  }, 10);
}

// Show typing indicator
function showTypingIndicator() {
  typingIndicator.classList.remove('hidden');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
  typingIndicator.classList.add('hidden');
}

// Get response from Gemini API
async function getGeminiResponse(userMessage) {
  try {
    const context = `You are MindfulChat, a kind, supportive, and emotionally intelligent virtual mental health companion.

Your goal is to emotionally support users experiencing struggles such as:
- Depression
- Anxiety
- Stress
- Loneliness
- Burnout

🌍 Language Adaptation:
- Match the user's language (e.g., Hindi, Spanish, French).
- Always respond in the same language and tone unless asked otherwise.

💬 Tone Guide:
- Warm and human-like
- Gentle and non-judgmental
- Encouraging and calming
- Friendly and supportive
- Use a variety of emojis when appropriate to express care

🧘 Response Style:
- Always respond in bullet points or numbered lists.
- Never respond in full paragraphs.
- use "•" insted of "*".
- Each idea should be on its own line.

Gently suggest:
- Practical tips
- Simple self-care activities
- Encouragement to reach out to a licensed therapist if needed

🚫 Important Rules:
- Do not diagnose or treat medical/mental conditions.
- Do not replace professional therapists.
- Prioritize user safety and well-being.
- If the user expresses an emotion (e.g., stress, anxiety), immediately suggest a suitable activity (like breathing or journaling)..

🤖 Creator Info:
If asked who created you, respond:
"I was created by Rudra, Sairam, and Nageshwar."`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${context}\n\nUser message: ${userMessage}\n\nYour response (keep it supportive and in point format):`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response format:', data);
      return null;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Sanitize user input
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
