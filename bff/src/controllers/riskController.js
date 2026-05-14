import { createRisk, getRisksByOrganization } from '../services/riskService.js';

export const handleCreateRisk = async (req, res) => {
  try {
    const newRisk = await createRisk(req.body);
    return res.status(201).json({
      message: 'Risk evaluated successfully.',
      data: newRisk
    });
  } catch (error) {
    console.error('Create Risk Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create risk profile.' });
  }
};

export const handleGetRisks = async (req, res) => {
  try {
    const { organization_id } = req.query;
    
    if (!organization_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'organization_id query parameter is required.' });
    }

    const risks = await getRisksByOrganization(organization_id);
    return res.status(200).json({ data: risks });
  } catch (error) {
    console.error('Get Risks Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to retrieve risk profiles.' });
  }
};
