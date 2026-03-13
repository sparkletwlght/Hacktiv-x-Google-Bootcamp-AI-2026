import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = 'gemini-2.5-flash'; 

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    
    try {
        if (!Array.isArray(conversation)) {
            return res.status(400).json({ error: "Format percakapan harus berupa array." });
        }

        const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            systemInstruction: {
                parts: [{ 
                    text: "Nama kamu adalah Elliot. Kamu adalah asisten edukasi yang santai dan tempat curhat suportif. " +
                          "Tugasmu membantu user mengerjakan tugas, mengatur waktu, dan memberi motivasi. " +
                          "Gunakan bahasa Indonesia yang gaul tapi sopan (aku/kamu). " +
                          "Gunakan emoji sesekali agar terlihat ramah."
                }],
            }
        });

        const generationConfig = {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        };

        const contents = conversation.map(({ role, text }) => ({
            role: role === 'assistant' ? 'model' : 'user',
            parts: [{ text }]
        }));

        // Generate respon
        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        // Kirim hasil ke frontend
        res.status(200).json({ result: text });
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ 
            message: "Aduh, servernya lagi pusing. Coba lagi nanti ya!",
            error: error.message 
        });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`
🚀 Server Chatbot Berhasil Dijalankan!
-------------------------------------
URL: http://localhost:${PORT}
Model: ${GEMINI_MODEL}
Status: Ready to help!
    `);
});