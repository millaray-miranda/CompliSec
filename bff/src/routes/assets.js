import express from 'express';
import { handleCreateAsset, handleGetAssets } from '../controllers/assetController.js';
import { validate } from '../middlewares/validate.js';
import { assetSchema } from '../middlewares/schemas.js';

const router = express.Router();

router.post('/', validate(assetSchema), handleCreateAsset);
router.get('/', handleGetAssets);

export default router;
