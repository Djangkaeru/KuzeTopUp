const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

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
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// ─── MIDDLEWARE ───────────────────────────────────────────────────────
function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    if (req.session.user.role !== 'admin') return res.redirect('/');
    next();
}

// ─── DATA GAME ────────────────────────────────────────────────────────
const games = [
    {
        id: 1, name: 'Mobile Legends', icon: '/images/ml.jpg',
        category: 'MOBA', badge: 'Populer',
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
        id: 2, name: 'Free Fire', icon: '/images/freefire.jpg',
        category: 'Battle Royale', badge: 'Hot',
        packages: [
            { name: '70 Diamond', price: 15000, bonus: null },
            { name: '140 Diamond', price: 29000, bonus: null },
            { name: '355 Diamond', price: 69000, bonus: '20 Diamond' },
            { name: '720 Diamond', price: 135000, bonus: '40 Diamond' },
            { name: '1450 Diamond', price: 265000, bonus: '80 Diamond' },
        ]
    },
    {
        id: 3, name: 'PUBG Mobile', icon: '/images/pubg.jpg',
        category: 'Battle Royale', badge: null,
        packages: [
            { name: '60 UC', price: 14000, bonus: null },
            { name: '325 UC', price: 69000, bonus: null },
            { name: '660 UC', price: 135000, bonus: '35 UC' },
            { name: '1800 UC', price: 359000, bonus: '100 UC' },
        ]
    },
    {
        id: 4, name: 'Genshin Impact', icon: '/images/genshin.jpg',
        category: 'RPG', badge: 'Baru',
        packages: [
            { name: '60 Genesis Crystal', price: 15000, bonus: null },
            { name: '300 Genesis Crystal', price: 69000, bonus: '30 Crystal' },
            { name: '980 Genesis Crystal', price: 215000, bonus: '110 Crystal' },
            { name: '1980 Genesis Crystal', price: 425000, bonus: '260 Crystal' },
        ]
    },
    {
        id: 5, name: 'Valorant', icon: '/images/valo.jpg',
        category: 'FPS', badge: null,
        packages: [
            { name: '475 VP', price: 49000, bonus: null },
            { name: '1000 VP', price: 99000, bonus: null },
            { name: '2050 VP', price: 195000, bonus: '100 VP' },
            { name: '3650 VP', price: 349000, bonus: '200 VP' },
        ]
    },
    {
        id: 6, name: 'Clash of Clans', icon: '/images/coc.jpg',
        category: 'Strategy', badge: null,
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

// ─── HELPER ───────────────────────────────────────────────────────────
function generateTransactionCode() {
    const now = new Date();
    const datePart = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('');
    return `KZ-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ─── ROUTES UTAMA ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.render('index', { games, user: req.session.user || null });
});

app.get('/game/:id', requireLogin, (req, res) => {
    const game = games.find(g => g.id === parseInt(req.params.id));
    if (!game) return res.redirect('/');
    res.render('game', { game, paymentMethods, user: req.session.user });
});

// ─── ORDER ────────────────────────────────────────────────────────────
app.post('/order', requireLogin, async (req, res) => {
    const { gameId, nominal, price, gameUserId, serverId, payment } = req.body;

    if (!gameId || !nominal || !price || !gameUserId || !payment)
        return res.json({ success: false, error: 'Data tidak lengkap!' });

    if (!gameUserId.trim() || gameUserId.trim().length < 3)
        return res.json({ success: false, error: 'User ID game tidak valid!' });

    const game = games.find(g => g.id === parseInt(gameId));
    if (!game) return res.json({ success: false, error: 'Game tidak ditemukan!' });

    const pkg = game.packages.find(p => p.name === nominal);
    if (!pkg) return res.json({ success: false, error: 'Paket tidak ditemukan!' });

    if (pkg.price !== parseInt(price))
        return res.json({ success: false, error: 'Harga tidak valid!' });

    try {
        const code = generateTransactionCode();
        await db.execute(
            `INSERT INTO transactions (code, user_id, game, nominal, game_user_id, server_id, payment, total, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [code, req.session.user.id, game.name, nominal, gameUserId.trim(), serverId || null, payment, pkg.price]
        );
        res.json({ success: true, code });
    } catch (err) {
        console.error('Order error:', err);
        res.json({ success: false, error: 'Gagal menyimpan transaksi!' });
    }
});

// ─── RIWAYAT TRANSAKSI USER ───────────────────────────────────────────
app.get('/history', requireLogin, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC`,
            [req.session.user.id]
        );
        res.render('history', { user: req.session.user, transactions: rows });
    } catch (err) {
        console.error(err);
        res.render('history', { user: req.session.user, transactions: [] });
    }
});

// ─── REGISTER ─────────────────────────────────────────────────────────
app.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword)
        return res.render('register', { error: 'Semua field wajib diisi!' });
    if (username.length < 3 || username.length > 20)
        return res.render('register', { error: 'Username harus 3–20 karakter!' });
    if (!/^[a-zA-Z0-9_]+$/.test(username))
        return res.render('register', { error: 'Username hanya boleh huruf, angka, dan _' });
    if (password.length < 6)
        return res.render('register', { error: 'Password minimal 6 karakter!' });
    if (password !== confirmPassword)
        return res.render('register', { error: 'Password dan konfirmasi tidak cocok!' });

    try {
        // Cek apakah sudah ada user sama sekali (untuk admin pertama)
        const [countRows] = await db.execute('SELECT COUNT(*) as total FROM users');
        const isFirst = countRows[0].total === 0;

        // Cek username & email duplikat
        const [existing] = await db.execute(
            'SELECT username, email FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            const taken = existing[0];
            return res.render('register', {
                error: taken.username === username ? 'Username sudah dipakai!' : 'Email sudah terdaftar!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = isFirst ? 'admin' : 'user';

        await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        req.session.successMessage = 'Akun berhasil dibuat! Silakan login.';
        res.redirect('/login');

    } catch (err) {
        console.error('Register error:', err);
        res.render('register', { error: 'Terjadi kesalahan, coba lagi!' });
    }
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

    if (!username || !password)
        return res.render('login', { error: 'Username dan password wajib diisi!', success: null });

    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ?', [username]
        );

        if (rows.length === 0)
            return res.render('login', { error: 'Username atau password salah!', success: null });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
            return res.render('login', { error: 'Username atau password salah!', success: null });

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        if (user.role === 'admin') return res.redirect('/admin');
        res.redirect('/');

    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { error: 'Terjadi kesalahan, coba lagi!', success: null });
    }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────
app.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// ─── ADMIN: DASHBOARD ─────────────────────────────────────────────────
app.get('/admin', requireAdmin, async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalTransactions }]] = await db.execute('SELECT COUNT(*) as totalTransactions FROM transactions');
        const [[{ totalRevenue }]] = await db.execute(
            "SELECT COALESCE(SUM(total), 0) as totalRevenue FROM transactions WHERE status = 'success'"
        );
        const [recentTransactions] = await db.execute(
            `SELECT t.*, u.username FROM transactions t
             JOIN users u ON t.user_id = u.id
             ORDER BY t.created_at DESC LIMIT 5`
        );
        const [recentUsers] = await db.execute(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );

        res.render('admin/dashboard', {
            user: req.session.user,
            stats: { totalUsers, totalTransactions, totalGames: games.length, totalRevenue },
            recentTransactions,
            recentUsers
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// ─── ADMIN: USERS ─────────────────────────────────────────────────────
app.get('/admin/users', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.render('admin/users', { user: req.session.user, users: rows });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

app.post('/admin/users/:id/delete', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (id === req.session.user.id) return res.redirect('/admin/users');
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
    } catch (err) {
        console.error(err);
    }
    res.redirect('/admin/users');
});

// ─── ADMIN: TRANSACTIONS ──────────────────────────────────────────────
app.get('/admin/transactions', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT t.*, u.username FROM transactions t
             JOIN users u ON t.user_id = u.id
             ORDER BY t.created_at DESC`
        );
        res.render('admin/transactions', { user: req.session.user, transactions: rows });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

app.post('/admin/transactions/:id/status', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['pending', 'success', 'failed'].includes(status)) return res.redirect('/admin/transactions');
    try {
        await db.execute('UPDATE transactions SET status = ? WHERE id = ?', [status, id]);
    } catch (err) {
        console.error(err);
    }
    res.redirect('/admin/transactions');
});

// ─── ADMIN: GAMES ─────────────────────────────────────────────────────
app.get('/admin/games', requireAdmin, (req, res) => {
    res.render('admin/games', { user: req.session.user, games });
});

// ─── START SERVER ─────────────────────────────────────────────────────
app.listen(3000, () => {
    console.log('KuzeTopUp berjalan di http://localhost:3000');
});
