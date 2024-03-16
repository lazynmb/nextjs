import { createRouter } from 'next-connect';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';

// Inicjalizacja klienta Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GCP_PROJECT_ID,
});

// Twoja nazwa bucketu w Google Cloud Storage
const bucketName = 'przechowywanie_plikow';

// Multer memory storage - pliki będą przechowywane w pamięci przed wysłaniem do GCS
const upload = multer({
  storage: multer.memoryStorage(),
});

const router = createRouter();

router.use(upload.single('file'));

router.post(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nie przesłano pliku' });
  }

  // Tworzenie unikalnej nazwy pliku
  const uniqueFilename = Date.now() + '-' + req.file.originalname;

  try {
    // Utworzenie referencji do bucketu
    const bucket = storage.bucket(bucketName);

    // Przesłanie pliku do bucketu GCS
    const blob = bucket.file(uniqueFilename);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'Nie udało się przesłać pliku' });
    });

    blobStream.on('finish', () => {
      // Plik został przesłany do GCS
      res.status(200).json({ fileName: uniqueFilename, message: 'Plik został przesłany' });
    });

    // Przesłanie danych pliku do strumienia
    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router.handler();

export const config = {
  api: {
    bodyParser: false,
  },
};
