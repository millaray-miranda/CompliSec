import { getSoAForOrganization, upsertSoA } from '../services/soaService.js';

export const handleGetSoA = async (req, res, next) => {
  try {
    const { organization_id } = req.query;
    if (!organization_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'El parámetro organization_id es requerido.' });
    }

    const soaData = await getSoAForOrganization(organization_id);
    return res.status(200).json({ data: soaData });
  } catch (error) {
    next(error);
  }
};

export const handleUpsertSoA = async (req, res, next) => {
  try {
    const updatedSoA = await upsertSoA(req.body);
    return res.status(200).json({
      message: 'SoA actualizado correctamente.',
      data: updatedSoA
    });
  } catch (error) {
    next(error);
  }
};
