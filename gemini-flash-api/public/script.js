const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const statusBot = document.getElementById('status-bot'); 
let chatHistory = [];

function setStatus(isOnline, message = "Online") {
    if (isOnline) {
        statusBot.textContent = `● ${message}`;
        statusBot.className = "status online";
    } else {
        statusBot.textContent = `○ ${message}`;
        statusBot.className = "status offline";
    }
}

window.addEventListener('online', () => setStatus(true, "Online"));
window.addEventListener('offline', () => setStatus(false, "Offline"));

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.classList.add('message', role === 'user' ? 'user-message' : 'bot-message');
    div.innerHTML = role === 'assistant' ? marked.parse(text) : text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    if (!navigator.onLine) {
        alert("Kamu sedang offline, periksa koneksi internetmu!");
        return;
    }

    appendMessage('user', text);
    chatHistory.push({ role: 'user', text });
    userInput.value = '';

    const loading = appendMessage('assistant', '...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: chatHistory })
        });

        if (!res.ok) throw new Error("Server down");

        const data = await res.json();
        loading.remove();
        
        if (data.result) {
            appendMessage('assistant', data.result);
            chatHistory.push({ role: 'assistant', text: data.result });
            setStatus(true, "Online"); 
        }
    } catch (err) {
        loading.innerText = "Gagal menghubungi Elliot (Server Offline).";
        setStatus(false, "Server Error"); 
        console.error(err);
    }
});

setStatus(navigator.onLine, navigator.onLine ? "Online" : "Offline");