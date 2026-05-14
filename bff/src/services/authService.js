import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-iso27001-key';

/**
 * Autentica a un usuario verificando su email y contraseña.
 * Retorna un token JWT si las credenciales son válidas.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Datos del usuario y el token JWT
 */
export const authenticateUser = async (email, password) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generar JWT
  const token = jwt.sign(
    { 
      userId: user.id, 
      organizationId: user.organization_id, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id
    },
    token
  };
};

/**
 * Genera un token JWT para un usuario existente (útil para auto-login post registro).
 */
export const generateTokenForUser = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      organizationId: user.organization_id, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
