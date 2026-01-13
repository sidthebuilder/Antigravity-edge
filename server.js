const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https'); // Required for API calls
const cors = require('cors');

// --- CONFIGURATION ---
const PORT = 3000;
const WORKSPACE_DIR = process.env.HOME + '/myserver_workspace';
// Ensure workspace
if (!fs.existsSync(WORKSPACE_DIR)) {
    try { fs.mkdirSync(WORKSPACE_DIR, { recursive: true }); } catch (e) { }
}

const CONFIG_FILE = path.join(__dirname, '.antigravity_config.json');
const SECURITY_TOKEN = "gravity-is-a-myth";
const GEMINI_KEY = "AIzaSyCcjXz2pe1Jrc9m2wHEyC4gRrrDOTlUw18"; // User provided key

// --- OPTIONAL TERMINAL SUPPORT ---
let pty = null;
try {
    pty = require('node-pty');
} catch (e) {
    console.log("NOTICE: 'node-pty' is missing. Terminal disabled.");
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- MIDDLEWARE ---
app.use((req, res, next) => {
    // Whitelist AI endpoint and static files
    if (req.path === '/' || req.path === '/index.html' || req.path.startsWith('/vs/') || req.path === '/api/ai-completion') return next();
    const token = req.headers['x-auth-token'] || req.query.token;
    if (token !== SECURITY_TOKEN) return res.status(403).json({ error: "Access Denied" });
    next();
});

// --- API: FILES ---
app.get('/api/files', (req, res) => {
    const dir = req.query.path ? path.join(WORKSPACE_DIR, req.query.path) : WORKSPACE_DIR;
    if (!dir.startsWith(WORKSPACE_DIR)) return res.status(403).send("Forbidden");
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) return res.json({ error: err.message });
        res.json(files.map(f => ({
            name: f.name,
            isDirectory: f.isDirectory(),
            path: path.relative(WORKSPACE_DIR, path.join(dir, f.name))
        })));
    });
});

app.get('/api/read', (req, res) => {
    const filePath = path.join(WORKSPACE_DIR, req.query.path);
    if (!filePath.startsWith(WORKSPACE_DIR)) return res.status(403).send("Forbidden");
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) return res.json({ error: err.message });
        res.json({ content });
    });
});

app.post('/api/save', (req, res) => {
    const filePath = path.join(WORKSPACE_DIR, req.body.path);
    if (!filePath.startsWith(WORKSPACE_DIR)) return res.status(403).send("Forbidden");
    fs.writeFile(filePath, req.body.content, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- API: GIT ---
app.get('/api/git/status', (req, res) => {
    exec('git status -s', { cwd: WORKSPACE_DIR }, (err, stdout, stderr) => {
        if (err) return res.json({ error: "Git not found or error" });
        res.json({ output: stdout });
    });
});

app.post('/api/git/commit', (req, res) => {
    const { message } = req.body;
    exec('git add . && git commit -m "' + message.replace(/"/g, '\\"') + '"', { cwd: WORKSPACE_DIR }, (err, stdout, stderr) => {
        if (err) return res.json({ error: stderr || err.message });
        res.json({ output: stdout });
    });
});

app.post('/api/git/push', (req, res) => {
    exec('git push', { cwd: WORKSPACE_DIR }, (err, stdout, stderr) => {
        if (err) return res.json({ error: stderr || err.message });
        res.json({ output: stdout });
    });
});

// --- API: REAL AI (GEMINI) ---
app.post('/api/ai-completion', (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) return res.json({ response: "Please type something." });

    const postData = JSON.stringify({
        contents: [{ parts: [{ text: "You are an expert pair programmer helping a user inside a custom mobile IDE. Keep answers concise. Question: " + prompt }] }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: '/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + GEMINI_KEY,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.candidates && json.candidates[0] && json.candidates[0].content) {
                    const reply = json.candidates[0].content.parts[0].text;
                    res.json({ response: reply });
                } else {
                    console.error("AI Error:", JSON.stringify(json)); // Log to Termux
                    res.json({ response: "AI Error: " + (json.error ? json.error.message : JSON.stringify(json)) });
                }
            } catch (e) {
                console.error("Parse Error:", e);
                res.json({ response: "Standard Error: " + e.message });
            }
        });
    });

    apiReq.on('error', (e) => {
        res.json({ response: "Network Error: " + e.message });
    });

    apiReq.write(postData);
    apiReq.end();
});

// --- API: CONFIG ---
app.get('/api/config', (req, res) => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            res.json(JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')));
        } else { res.json({}); }
    } catch (e) { res.json({}); }
});

app.post('/api/config', (req, res) => {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SERVER ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    if (!pty) {
        ws.send("Terminal disabled (node-pty missing).\r\n");
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Antigravity Server Running on port ${PORT}`);
});
