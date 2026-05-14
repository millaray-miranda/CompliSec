import { authenticateUser } from '../services/authService.js';

export const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const { user, token } = await authenticateUser(email, password);

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Unauthorized', message: 'Correo o contraseña incorrectos.' });
    }
    next(error);
  }
};
