const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── SESSION ──────────────────────────────────────────────────────────
app.use(session({
    secret: 'kuzetopup-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 hari
}));

// ─── SIMPAN USER (sementara, nanti pindah ke MySQL) ───────────────────
// Format: { id, username, email, password (hashed), createdAt }
const users = [];

// ─── MIDDLEWARE CEK LOGIN ─────────────────────────────────────────────
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// ─── DATA GAME ────────────────────────────────────────────────────────
const games = [
    {
        id: 1,
        name: 'Mobile Legends',
        icon: '/images/ml.jpg',
        category: 'MOBA',
        badge: 'Populer',
        packages: [
            { name: '86 Diamond', price: 19000, bonus: null },
            { name: '172 Diamond', price: 37000, bonus: '12 Diamond' },
            { name: '257 Diamond', price: 55000, bonus: null },
            { name: '344 Diamond', price: 73000, bonus: '20 Diamond' },
            { name: '514 Diamond', price: 109000, bonus: '30 Diamond' },
            { name: '1024 Diamond', price: 215000, bonus: '60 Diamond' },
        ]
    },
    {
        id: 2,
        name: 'Free Fire',
        icon: '/images/freefire.jpg',
        category: 'Battle Royale',
        badge: 'Hot',
        packages: [
            { name: '70 Diamond', price: 15000, bonus: null },
            { name: '140 Diamond', price: 29000, bonus: null },
            { name: '355 Diamond', price: 69000, bonus: '20 Diamond' },
            { name: '720 Diamond', price: 135000, bonus: '40 Diamond' },
            { name: '1450 Diamond', price: 265000, bonus: '80 Diamond' },
        ]
    },
    {
        id: 3,
        name: 'PUBG Mobile',
        icon: '/images/pubg.jpg',
        category: 'Battle Royale',
        badge: null,
        packages: [
            { name: '60 UC', price: 14000, bonus: null },
            { name: '325 UC', price: 69000, bonus: null },
            { name: '660 UC', price: 135000, bonus: '35 UC' },
            { name: '1800 UC', price: 359000, bonus: '100 UC' },
        ]
    },
    {
        id: 4,
        name: 'Genshin Impact',
        icon: '/images/genshin.jpg',
        category: 'RPG',
        badge: 'Baru',
        packages: [
            { name: '60 Genesis Crystal', price: 15000, bonus: null },
            { name: '300 Genesis Crystal', price: 69000, bonus: '30 Crystal' },
            { name: '980 Genesis Crystal', price: 215000, bonus: '110 Crystal' },
            { name: '1980 Genesis Crystal', price: 425000, bonus: '260 Crystal' },
        ]
    },
    {
        id: 5,
        name: 'Valorant',
        icon: '/images/valo.jpg',
        category: 'FPS',
        badge: null,
        packages: [
            { name: '475 VP', price: 49000, bonus: null },
            { name: '1000 VP', price: 99000, bonus: null },
            { name: '2050 VP', price: 195000, bonus: '100 VP' },
            { name: '3650 VP', price: 349000, bonus: '200 VP' },
        ]
    },
    {
        id: 6,
        name: 'Clash of Clans',
        icon: '/images/coc.jpg',
        category: 'Strategy',
        badge: null,
        packages: [
            { name: '80 Gems', price: 13000, bonus: null },
            { name: '500 Gems', price: 75000, bonus: null },
            { name: '1200 Gems', price: 170000, bonus: '50 Gems' },
            { name: '2500 Gems', price: 340000, bonus: '100 Gems' },
        ]
    }
];

const paymentMethods = [
    { name: 'QRIS', description: 'Scan semua e-wallet', icon: 'fa-qrcode' },
    { name: 'DANA', description: 'Bayar dari aplikasi DANA', icon: 'fa-wallet' },
    { name: 'OVO', description: 'Masukkan nomor OVO aktif', icon: 'fa-mobile-screen-button' },
    { name: 'GoPay', description: 'Bayar lewat aplikasi Gojek', icon: 'fa-wallet' },
    { name: 'ShopeePay', description: 'Cocok untuk promo e-wallet', icon: 'fa-bag-shopping' },
    { name: 'Bank Transfer', description: 'BCA, BRI, Mandiri, BNI', icon: 'fa-building-columns' }
];

// ─── ROUTES UTAMA ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.render('index', { games, user: req.session.user || null });
});

app.get('/game/:id', requireLogin, (req, res) => {
    const game = games.find(g => g.id === parseInt(req.params.id));
    if (!game) return res.redirect('/');
    res.render('game', { game, paymentMethods, user: req.session.user });
});

// ─── REGISTER ─────────────────────────────────────────────────────────
app.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validasi server-side
    if (!username || !email || !password || !confirmPassword) {
        return res.render('register', { error: 'Semua field wajib diisi!' });
    }

    if (username.length < 3 || username.length > 20) {
        return res.render('register', { error: 'Username harus 3–20 karakter!' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.render('register', { error: 'Username hanya boleh huruf, angka, dan _' });
    }

    if (password.length < 6) {
        return res.render('register', { error: 'Password minimal 6 karakter!' });
    }

    if (password !== confirmPassword) {
        return res.render('register', { error: 'Password dan konfirmasi tidak cocok!' });
    }

    // Cek username/email sudah dipakai
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        if (existingUser.username === username) {
            return res.render('register', { error: 'Username sudah dipakai!' });
        }
        return res.render('register', { error: 'Email sudah terdaftar!' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password: hashedPassword,
        createdAt: new Date()
    };
    users.push(newUser);

    // Redirect ke login dengan pesan sukses
    req.session.successMessage = 'Akun berhasil dibuat! Silakan login.';
    res.redirect('/login');
});

// ─── LOGIN ────────────────────────────────────────────────────────────
app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    const success = req.session.successMessage || null;
    delete req.session.successMessage;
    res.render('login', { error: null, success });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { error: 'Username dan password wajib diisi!', success: null });
    }

    // Cari user
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.render('login', { error: 'Username atau password salah!', success: null });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.render('login', { error: 'Username atau password salah!', success: null });
    }

    // Simpan ke session (tanpa password)
    req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
    };

    res.redirect('/');
});

// ─── LOGOUT ───────────────────────────────────────────────────────────
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ─── START SERVER ─────────────────────────────────────────────────────
app.listen(3000, () => {
    console.log('KuzeTopUp berjalan di http://localhost:3000');
});
