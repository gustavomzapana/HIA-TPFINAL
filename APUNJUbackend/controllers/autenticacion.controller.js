const autenticacionService = require('../services/autenticacion.service');

const autenticacionCtrl = {}; // Creamos un objeto para el controlador
autenticacionCtrl.loginWithGoogle = async (req, res) => {
    // Este controlador maneja el inicio de sesión con Google
    // recibe el token de ID de Google desde el cuerpo de la solicitud
    const { id_token } = req.body;
  try {
    // Verificamos el token de ID de Google y obtenemos la información del usuario
    const { usuario, token } = await autenticacionService.loginWithGoogle(id_token);
    res.status(200).json({ message: 'Inicio de sesión exitoso', usuario, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = autenticacionCtrl; // Exportamos el controlador para usarlo en las rutas
