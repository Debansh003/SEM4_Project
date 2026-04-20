import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const server = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MIDDLEWARE =================
server.use(express.urlencoded({ extended: false }));
server.use('/static', express.static(__dirname));

server.set('trust proxy', 1);

server.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,       // REQUIRED on Render
        sameSite: 'none'    // important for deployment
    }
}));

// ================= AUTH MIDDLEWARE =================
function isAuth(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

// ================= ROUTES =================

// 🔒 PROTECTED
server.get('/', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'index.html')); // dashboard
    } else {
        res.redirect('/login'); // force login first
    }
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
    const { name, email, password } = req.body;

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

        // 🔐 HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        res.send(`
            <script>
                alert("Signup successful!");
                window.location.href = "/login";
            </script>
        `);

    } catch (err) {
        console.log(err);
    }
});

// ================= LOGIN =================
server.post('/login-submit', async (req, res) => {
    const { email, password } = req.body;

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

        // 🔐 CHECK PASSWORD
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.send(`
                <script>
                    alert("Wrong password!");
                    window.location.href = "/login";
                </script>
            `);
        }

        // ✅ STORE SESSION
        req.session.user = user;

        res.send(`
            <script>
                alert("Login successful!");
                window.location.href = "/";
            </script>
        `);

    } catch (err) {
        console.log(err);
    }
});

// ================= LOGOUT =================
server.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ================= CONTACT =================
server.post('/contact-submit', isAuth, async (req, res) => {
    const { name, email, message } = req.body;

    if (!message || message.trim() === "") {
        return res.send(`
            <script>
                alert("Message is required!");
                window.history.back();
            </script>
        `);
    }

    try {
        await prisma.contact.create({
            data: { name, email, message }
        });

        res.send(`
            <script>
                alert("Message submitted!");
                window.location.href = "/contact";
            </script>
        `);
    } catch (err) {
        console.log(err);
    }
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

    res.redirect(`/result.html?energy=${energy}`);
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

    res.redirect(`/result.html?energy=${energy}`);
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});