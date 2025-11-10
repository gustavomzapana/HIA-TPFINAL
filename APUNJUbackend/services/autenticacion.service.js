const userRepository = require('../repositories/usuario.repository');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Asegúrense de tener configurada la variable de entorno GOOGLE_CLIENT_ID en el archivo .env
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const autenticacionService = {

  async loginWithGoogle(id_token) {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // Especifica el ID de cliente de Google
    });
    const payload = ticket.getPayload();
    
    // Aquí puedes buscar al usuario en tu base de datos por su correo electrónico
    let usuario = await userRepository.getUserByEmail(payload.email);
    
    if (!usuario) {
      //Si no existe tiramos error
        throw new Error('El usuario no existe en la BD');
    }
     if (!usuario.activo) {
      throw new Error("Usuario inactivo");
    }
    // Generar token propio de sesión
    const jwtToken = jwt.sign(
      { uid: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    return {
        usuario: {
          _id: usuario._id,
          legajo: usuario.legajo,
          nombre: usuario.nombre,
          apellido:usuario.apellido,
          dni: usuario.dni,
          email: usuario.email,
          foto: usuario.foto,
          rol: usuario.rol,
          domicilio: usuario.domicilio,
          dependencia: usuario.dependencia,
          fNacimiento: usuario.fNacimiento,
          telefono: usuario.telefono,
          esAfiliado: usuario.esAfiliado,
          activo: usuario.activo
        },
        token: jwtToken,
      };
  }
};

module.exports = autenticacionService;

// Este servicio maneja la autenticación de usuarios utilizando Google OAuth2
// y permite iniciar sesión con una cuenta de Google.