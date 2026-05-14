import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-iso27001-key';

/**
 * Middleware para validar el token JWT en las cabeceras de la petición.
 * Protege las rutas contra accesos no autenticados.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No se proporcionó token de autenticación.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Añadir el usuario decodificado a la petición para los siguientes middlewares/controladores
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token inválido o expirado.' });
  }
};

/**
 * Middleware de autorización basada en roles (RBAC).
 * Verifica si el rol del usuario autenticado está en la lista de roles permitidos.
 * 
 * @param {string[]} allowedRoles - Array de roles permitidos (ej. ['ADMIN', 'CISO'])
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No se pudo identificar el rol del usuario.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'No tiene permisos suficientes para realizar esta acción.' });
    }

    next();
  };
};
