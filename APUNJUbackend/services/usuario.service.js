const bcrypt = require("bcrypt");
const userRepository = require("../repositories/usuario.repository");
const jwt = require("jsonwebtoken");
const { enviarCorreo } = require("../services/email/emailService");

const userService = {
  createAfiliado: async (userData) => {
    const emailExists = await userRepository.getUserByEmail(userData.email);
    if (emailExists) {
      throw new Error("Email ya existente ");
    }
    const dniExists = await userRepository.getUserByDni(userData.dni);
    if (dniExists) {
      throw new Error("DNI ya existente");
    }
    const legajoExists = await userRepository.getUserByLegajo(userData.legajo);
    if (legajoExists) {
      throw new Error("Legajo ya existente");
    }
    const datos = {
      nombre: userData.nombre,
      email: userData.email,
    };
    // Asignamos el DNI como contraseña por defecto
    const hashedPassword = await bcrypt.hash(userData.dni, 10);
    userData.password = hashedPassword;
    //userData.rol = "Afiliado"; // Asignar rol de afiliado
    userData.activo = true; // Aseguramos que el usuario esté activo
    console.log("paso las validaciones de email,dni,legajo");
    await enviarCorreo("creacionCuenta", datos);
    return await userRepository.createUser(userData);
  },
  //creaa de tipo Invitados
  createInvitado: async (userData) => {
    const emailExists = await userRepository.getUserByEmail(userData.email);
    if (emailExists) {
      throw new Error("Email ya existente ");
    }
    const dniExists = await userRepository.getUserByDni(userData.dni);
    if (dniExists) {
      throw new Error("DNI ya existente");
    }
    // Asignamos el DNI como contraseña por defecto
    const hashedPassword = await bcrypt.hash(userData.dni, 10);
    userData.rol = "Invitado"; // Asignar rol de invitado
    userData.activo = true; // Aseguramos que el usuario esté activo
    userData.esAfiliado = false; // Aseguramos que no sea afiliado
    userData.password = hashedPassword;
    userData.legajo =
      "INV-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    console.log("paso las validaciones de email,dni");
    const datos = {
      nombre: userData.nombre,
      email: userData.email,
    };
   // await enviarCorreo("creacionCuenta", datos);
    return await userRepository.createUser(userData);
  },
  getUsers: async () => {
    return await userRepository.getAllUsers();
  },
  getUserById: async (id) => {
    return await userRepository.getUserById(id);
  },
  getUserByEmail: async (email) => {
    return await userRepository.getUserByEmail(email);
  },
  getUserByLegajo: async (legajo) => {
    return await userRepository.getUserByLegajo(legajo);
  },

  getUserByDni: async (dni) => {
    return await userRepository.getUserByDni(dni);
  },

  updateUser: async (id, userData) => {
    return await userRepository.updateUser(id, userData);
  },

  deleteUser: async (id) => {
    return await userRepository.deleteUser(id);
  },
  loginUser: async (dni, password) => {
   
    if (!dni || !password) {
      throw new Error("DNI y contraseña son requeridos");
    }
    const usuario = await userRepository.getUserByDni(dni);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
     if (!usuario.activo) {
    throw new Error("Usuario inactivo");
   }
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new Error("Contraseña incorrecta");
    }
    // Generar token JWT
    const jwtToken = jwt.sign(
      { uid: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    return {
      usuario: {
        id: usuario.id,
        _id: usuario.id, // Mantener _id para compatibilidad con frontend
        legajo: usuario.legajo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        email: usuario.email,
        foto: usuario.foto,
        rol: usuario.rol,
        domicilio: usuario.domicilio,
        dependencia: usuario.dependencia,
        fNacimiento: usuario.fNacimiento,
        telefono: usuario.telefono,
        esAfiliado: usuario.esAfiliado,
        activo: usuario.activo,
      },
      token: jwtToken,
    };
  },
  getUsersByDependency: async (dependencia) => {
    return await userRepository.getUsersByDependency(dependencia);
  },
  getDesafiliados: async () => {
    return await userRepository.getDesafiliados();
  },
  getInvitados: async () => {
    return await userRepository.getInvitados();
  },
  changePassword: async ({ userId, currentPassword, newPassword }) => {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return { success: false, message: "La contraseña actual no es correcta" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUser(userId, { password: hashedPassword });

    // enviamos el correo de confirmación
    const emailData = {
      nombre: user.nombre,
      email: user.email,
    };
    await enviarCorreo("cambioContrasenia", emailData);
    return { success: true };
  },
  resetPassword: async (dni) => {
    const user = await userRepository.getUserByDni(dni);
    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Generar una nueva contraseña
    const newPassword = user.dni; // Usamos el DNI como nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUser(user.id, { password: hashedPassword });
    // Enviar correo con la nueva contraseña
    const emailData = {
      nombre: user.nombre,
      email: user.email,
      nuevaContrasena: newPassword,
    };
    await enviarCorreo("recuperacionContrasenia", emailData);

    return { success: true };
  },
};

module.exports = userService;
