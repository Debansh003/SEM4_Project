import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const server = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MIDDLEWARE =================
server.use(express.urlencoded({ extended: false }));
server.use(express.static(__dirname));

// ================= AUTH =================
function isAuth(req, res, next) {
    if (req.query.user) next();
    else res.redirect('/login');
}

// ================= ROUTES =================

// 🔒 PROTECTED
server.get('/', isAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.get('/about', isAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

server.get('/contact', isAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// 🔓 PUBLIC
server.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

server.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// ================= SIGNUP =================
server.post('/signup-submit', async (req, res) => {
    const { name, email } = req.body;

    try {
        const exists = await prisma.user.findUnique({ where: { email } });

        if (exists) {
            return res.send(`
                <script>
                    alert("User already exists! Please login.");
                    window.location.href = "/login";
                </script>
            `);
        }

        await prisma.user.create({ data: { name, email } });

        res.send(`
            <script>
                alert("Signup successful!");
                window.location.href = "/?user=${email}";
            </script>
        `);

    } catch (err) {
        console.log(err);
    }
});

// ================= LOGIN =================
server.post('/login-submit', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.send(`
                <script>
                    alert("User not found! Signup first.");
                    window.location.href = "/signup";
                </script>
            `);
        }

        res.send(`
            <script>
                alert("Login successful!");
                window.location.href = "/?user=${email}";
            </script>
        `);

    } catch (err) {
        console.log(err);
    }
});

// ================= CONTACT =================
server.post('/contact-submit', (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === "") {
        return res.send(`
            <script>
                alert("Message is required!");
                window.history.back();
            </script>
        `);
    }

    fs.readFile('contact.txt', 'utf-8', (err, data) => {
        let contacts = [];

        if (!err && data) {
            try {
                contacts = JSON.parse(data);
            } catch {}
        }

        contacts.push(req.body);

        fs.writeFile('contact.txt', JSON.stringify(contacts, null, 2), (err) => {
            if (err) console.log(err);
            else {
                res.send(`
                    <script>
                        alert("Message submitted!");
                        window.location.href = "/contact?user=${req.query.user}";
                    </script>
                `);
            }
        });
    });
});

// ================= ENERGY =================

// ☀️ SOLAR
server.post('/predict', isAuth, (req, res) => {
    const { area, efficiency, irradiance, pr } = req.body;

    const energy =
        parseFloat(area) *
        parseFloat(efficiency) *
        parseFloat(irradiance) *
        parseFloat(pr);

    res.redirect(`/result.html?energy=${energy}&user=${req.query.user}`);
});

// 🌬️ WIND
server.post('/predict-wind', isAuth, (req, res) => {
    const { area, airDensity, velocity, cp, efficiency } = req.body;

    const energy =
        0.5 *
        parseFloat(airDensity) *
        parseFloat(area) *
        Math.pow(parseFloat(velocity), 3) *
        parseFloat(cp) *
        parseFloat(efficiency);

    res.redirect(`/result.html?energy=${energy}&user=${req.query.user}`);
});

// ================= SERVER =================
server.listen(3000, () => {
    console.log("Server: http://localhost:3000");
});