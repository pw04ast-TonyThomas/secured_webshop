const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const router     = express.Router();
const controller = require('../controllers/ProfileController');
// Import the Auth middleware
const auth       = require('../middleware/auth');

// Use the middleware
router.use(auth)

// Configuration de multer pour l'upload de photos
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename: (_req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

        // Force une bonne extension qui est lowercase
        const ext = path.extname(file.originalname).toLowerCase();

        callback(null, uniqueSuffix + ext);
    }
});

// Filtrage des fichiers que je veux accepté
function fileFilter(_req, file, callback) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
        return callback(new Error('Format de fichier non autorisé'), false);
    }

    callback(null, true);
}

// On crée la norme Multer.
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2mb pour pas de fichier trop volumineux.
    }
});

router.get('/', controller.get);
router.post('/', controller.update);
// Check d'erreur Multer
router.post('/photo', (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err instanceof multer.MulterError || err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, controller.uploadPhoto);

module.exports = router;
