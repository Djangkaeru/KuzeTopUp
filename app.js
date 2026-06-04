const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    {
        name: 'QRIS',
        description: 'Scan semua e-wallet',
        icon: 'fa-qrcode'
    },
    {
        name: 'DANA',
        description: 'Bayar dari aplikasi DANA',
        icon: 'fa-wallet'
    },
    {
        name: 'OVO',
        description: 'Masukkan nomor OVO aktif',
        icon: 'fa-mobile-screen-button'
    },
    {
        name: 'GoPay',
        description: 'Bayar lewat aplikasi Gojek',
        icon: 'fa-wallet'
    },
    {
        name: 'ShopeePay',
        description: 'Cocok untuk promo e-wallet',
        icon: 'fa-bag-shopping'
    },
    {
        name: 'Bank Transfer',
        description: 'BCA, BRI, Mandiri, BNI',
        icon: 'fa-building-columns'
    }
];

app.get('/', (req, res) => {
    res.render('index', { games });
});

app.get('/game/:id', (req, res) => {
    const game = games.find(g => g.id === parseInt(req.params.id));
    if (!game) return res.redirect('/');
    res.render('game', { game, paymentMethods });
});

app.listen(3000, () => {
    console.log('KuzeTopUp berjalan di http://localhost:3000');
});
