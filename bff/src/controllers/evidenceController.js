import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { saveEvidence, getEvidencesBySoaId } from '../services/evidenceService.js';

// Configurar multer para almacenar archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para el archivo para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const handleUploadEvidence = async (req, res, next) => {
  try {
    const { soa_id } = req.body;
    
    if (!soa_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'El ID del SoA es requerido.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: 'No se subió ningún archivo.' });
    }

    // La URL pública para acceder al archivo (basado en la carpeta estática que expondremos en Express)
    const fileUrl = `/uploads/${req.file.filename}`;
    const documentName = req.file.originalname;
    
    // Obtenemos el userId del token decodificado (inyectado por authMiddleware)
    const uploadedBy = req.user?.userId;

    const evidence = await saveEvidence({
      soa_id,
      document_name: documentName,
      file_url: fileUrl,
      uploaded_by: uploadedBy
    });

    return res.status(201).json({
      message: 'Evidencia subida correctamente.',
      data: evidence
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetEvidences = async (req, res, next) => {
  try {
    const { soa_id } = req.params;
    
    if (!soa_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'El ID del SoA es requerido.' });
    }

    const evidences = await getEvidencesBySoaId(soa_id);
    return res.status(200).json({ data: evidences });
  } catch (error) {
    next(error);
  }
};
