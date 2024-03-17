import { IncomingForm } from 'formidable';
import { put } from '@vercel/blob';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    if (!files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Załóżmy, że obsługujemy tylko pojedynczy plik
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filename = file.originalFilename;

    if (!filename) {
      return res.status(400).json({ error: 'File name not provided' });
    }

    console.log('Uploading file:', filename);

    try {
      const blobResponse = await put(filename, fs.createReadStream(file.filepath), { access: 'public' });
      return res.status(200).json(blobResponse);
    } catch (error) {
      console.error('Upload failed:', error);
      return res.status(500).json({ error: 'Failed to upload file' });
    }
  });
}
