import { createAsset, getAssetsByOrganization } from '../services/assetService.js';

export const handleCreateAsset = async (req, res) => {
  try {
    const newAsset = await createAsset(req.body);
    return res.status(201).json({
      message: 'Asset registered successfully.',
      data: newAsset
    });
  } catch (error) {
    console.error('Create Asset Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create asset.' });
  }
};

export const handleGetAssets = async (req, res) => {
  try {
    // For now, we expect organization_id as a query param (to be replaced with JWT payload later)
    const { organization_id } = req.query;
    
    if (!organization_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'organization_id query parameter is required.' });
    }

    const assets = await getAssetsByOrganization(organization_id);
    return res.status(200).json({ data: assets });
  } catch (error) {
    console.error('Get Assets Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to retrieve assets.' });
  }
};
