import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import session from 'express-session';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const server = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SALT_ROUNDS = 12;

// ================= MIDDLEWARE =================
server.use(express.urlencoded({ extended: false }));
server.use(express.static(__dirname));

server.use(session({
    secret: process.env.SESSION_SECRET || 'energypredict-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7   // 7 days
    }
}));

// ================= AUTH =================
function isAuth(req, res, next) {
    if (req.session && req.session.userId) next();
    else res.redirect('/login');
}

// ================= ROUTES =================

// PROTECTED
server.get('/', isAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.get('/about', isAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

server.get('/contact', isAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// PUBLIC
server.get('/login', (req, res) => {
    if (req.session && req.session.userId) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

server.get('/signup', (req, res) => {
    if (req.session && req.session.userId) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'signup.html'));
});

server.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// ================= SIGNUP =================
server.post('/signup-submit', async (req, res) => {
    const { name, email, password } = req.body;

    if (!password || password.length < 6) {
        return res.send(`
            <script>
                alert("Password must be at least 6 characters.");
                window.history.back();
            </script>
        `);
    }

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

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });

        req.session.userId = user.id;
        req.session.userName = user.name;

        res.redirect('/');

    } catch (err) {
        console.log(err);
        res.send(`<script>alert("Something went wrong."); window.history.back();</script>`);
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
                    alert("User not found! Please signup first.");
                    window.location.href = "/signup";
                </script>
            `);
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.send(`
                <script>
                    alert("Incorrect password. Please try again.");
                    window.history.back();
                </script>
            `);
        }

        req.session.userId = user.id;
        req.session.userName = user.name;

        res.redirect('/');

    } catch (err) {
        console.log(err);
        res.send(`<script>alert("Something went wrong."); window.history.back();</script>`);
    }
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
            data: {
                name,
                email,
                message,
                userId: req.session.userId
            }
        });

        res.redirect('/contact');
    } catch (err) {
        console.log(err);
        res.send(`<script>alert("Something went wrong."); window.history.back();</script>`);
    }
});

// ================= ENERGY =================

// SOLAR
server.post('/predict', isAuth, (req, res) => {
    const { area, efficiency, irradiance, pr } = req.body;

    const energy =
        parseFloat(area) *
        parseFloat(efficiency) *
        parseFloat(irradiance) *
        parseFloat(pr);

    res.redirect(`/result.html?energy=${energy}`);
});

// WIND
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
server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log("Server running on port " + (process.env.PORT || 3000));
});