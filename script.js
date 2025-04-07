// DOM Elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const burgerMenu = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');

// Your Gemini API Key - In production, this should be secured and not directly in the code
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
        top: targetElement.offsetTop - 70, // Offset for navbar
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    }
  });
});

// Initialize chat with welcome messages
function initializeChat() {
  // Delay first message
  setTimeout(() => {
    addMessage(initialMessages[0], 'bot');
    
    // Delay second message
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
  
  // Add user message to chat
  addMessage(userMessage, 'user');
  
  // Clear input field
  userInput.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    // Get response from Gemini API
    const response = await getGeminiResponse(userMessage);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Add bot response to chat
    if (response) {
      // Short delay to make it feel more natural
      setTimeout(() => {
        addMessage(response, 'bot');
      }, 500);
    } else {
      setTimeout(() => {
        addMessage("I'm sorry, I couldn't process your request. Please try again.", 'bot');
      }, 500);
    }
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
  textDiv.textContent = text;
  
  messageDiv.appendChild(textDiv);
  chatMessages.appendChild(messageDiv);
  
  // Scroll to bottom of chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Add animation class after a small delay to trigger animation
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
    // Define context to guide the AI's responses
    const context = `You are MindfulChat, a kind, supportive, and emotionally intelligent virtual mental health companion.
Your goal is to emotionally support users who are experiencing struggles such as depression, anxiety, stress, loneliness, or burnout.

🌍 Language Adaptation:
If the user writes in a specific language (like Hindi, Spanish, French, etc.), respond in that same language. Always match their tone and language unless specifically asked otherwise.

💬 Tone Guide:

Warm and human-like

Gentle and non-judgmental

Encouraging and calming

Friendly and supportive, using emojis when appropriate to express care .

🧘 When suitable, gently offer:

Practical tips (e.g., breathing exercises, grounding techniques, journaling)

Simple self-care activities (like a gratitude prompt, mindfulness practice, or body scan)

Encouragement to reach out to a licensed therapist if things feel overwhelming

🚫 Important Rules:

Never attempt to diagnose or treat any medical or mental condition.

Do not replace the role of professional therapists.

Always prioritize safety, empathy, and user well-being.

💡 Examples of Empathetic Responses:

“I'm really sorry you're going through this. Would you like to try a simple breathing technique with me? 🧘‍♂️💨”

“It’s okay to not be okay. You’re not alone in this. ”

“When you're feeling anxious, grounding exercises like the 5-4-3-2-1 technique can really help. Want to try one together? 🌿”

“Sometimes writing down your thoughts can help clear your mind. Would you like a journaling prompt? 📝”

“I'm always here to talk 💬, but I also encourage speaking with a therapist if things feel too heavy.”

"Use Some variety of emoji."

If anyone ask you who created you then say Rudra, Sairam, Nageshwar.
`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `${context}\n\nUser message: ${userMessage}\n\nYour response (keep it supportive and brief):`
        }]
      }],
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
    
    // Extract the response text from the Gemini API response
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

// Add some basic message sanitization
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}