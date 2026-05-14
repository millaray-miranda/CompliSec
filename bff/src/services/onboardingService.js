import { getClient } from '../config/db.js';
import bcrypt from 'bcrypt';

export const createOrganizationAndAdmin = async (organizationData, adminData) => {
  const client = await getClient();
  
  try {
    // Iniciar transacción atómica
    await client.query('BEGIN');
    
    // 1. Insertar Organización
    const orgInsertQuery = `
      INSERT INTO organizations (name, industry, size) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `;
    const orgResult = await client.query(orgInsertQuery, [
      organizationData.name, 
      organizationData.industry, 
      organizationData.size
    ]);
    
    const organizationId = orgResult.rows[0].id;
    
    // 2. Hash de contraseña e insertar Admin User
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminData.password, saltRounds);
    
    const userInsertQuery = `
      INSERT INTO users (organization_id, name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, name, email, role
    `;
    const userResult = await client.query(userInsertQuery, [
      organizationId,
      adminData.name,
      adminData.email,
      passwordHash,
      'ADMIN' // El primer usuario es el admin del tenant
    ]);
    
    // Commit de la transacción si todo salió bien
    await client.query('COMMIT');
    
    return {
      organizationId,
      user: userResult.rows[0]
    };
    
  } catch (error) {
    // Rollback en caso de cualquier error (ej. email duplicado)
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Liberar cliente al pool
    client.release();
  }
};
