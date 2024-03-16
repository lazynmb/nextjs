// pages/api/upload.js
import { createRouter } from 'next-connect';
import multer from 'multer';

// Konfiguracja multer do przechowywania przesłanych plików
const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads', // Ścieżka, gdzie będą zapisywane pliki
    filename: (req, file, cb) => {
      const uniqueFilename = Date.now() + '-' + file.originalname;
      cb(null, uniqueFilename);
    },
  }),
});

// Tworzenie routera za pomocą next-connect
const router = createRouter();

// Dodanie middleware do obsługi przesyłania plików
router.use(upload.single('file'));

router.post((req, res) => {
  if (req.file) {
    // Plik został przesłany, zwracamy nazwę pliku jako część odpowiedzi
    res.status(200).json({ fileName: req.file.filename, message: 'Plik został przesłany' });
  } else {
    // Nie znaleziono pliku w żądaniu
    res.status(400).json({ error: 'Nie przesłano pliku' });
  }
});

export default router.handler();

export const config = {
  api: {
    bodyParser: false, // Wyłączenie domyślnego parsowania ciała żądania
  },
};
