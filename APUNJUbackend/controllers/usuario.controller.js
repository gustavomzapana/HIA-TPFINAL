const { Usuario: User } = require('../models');
const userService = require('../services/usuario.service'); 
const userCtrl = {}; // Creamos un objeto para el controlador

// Endpoint encargado de crear un afiliado
userCtrl.createAfiliado = async (req, res) => {
  console.log('datos recibidos:', req.body)
  try {
    const user = await userService.createAfiliado(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Endpoint encargado de crear un Invitado
userCtrl.createInvitado = async (req, res) => {
  console.log("creando invitado");
  try {
    const user = await userService.createInvitado(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
userCtrl.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
userCtrl.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
userCtrl.getUserByLegajo = async (req, res) => {
    try{
        const user = await userService.getUserByLegajo(req.params.legajo);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
userCtrl.getUserByDni = async (req, res) => {
  try {
    const user = await userService.getUserByDni(req.params.dni);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
userCtrl.getUserByEmail = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

userCtrl.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Endpoint encargado de eliminar de manera logica un afiliado
userCtrl.deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Endpoint que devuelve afiliados por dependencia
userCtrl.byDependency = async (req, res) => {
 try {
    const users = await userService.getUsersByDependency(req.params.dependencia);
    console.log(`Usuarios para dependencia '${req.params.dependencia}':`, users);
    res.json(users);
  } catch (error) {
    console.error('Error en Dependencia:', error);
    res.status(500).json({ message: error.message });
  }
};
//Endpoint del Login de usuario
userCtrl.loginUser = async (req, res) => {
  const { dni, password } = req.body;
  try {
    const { usuario, token } = await userService.loginUser(dni, password);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    } 
    res.status(200).json({ message: 'Inicio de sesión exitoso', usuario, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
userCtrl.getDesafiliados = async (req, res) => {
  try {
    const desafiliados = await userService.getDesafiliados();
    res.json(desafiliados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

userCtrl.getInvitados = async (req, res) => {
  try {
    const invitados = await userService.getInvitados();
    res.json(invitados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
userCtrl.newPassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const result = await userService.changePassword({ userId, currentPassword, newPassword });

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

userCtrl.resetPassword = async (req, res) => {
  const { dni } = req.params; // Obtenemos el DNI del params
  try {
    const result = await userService.resetPassword(dni);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    return res.json({ message: 'Contraseña restablecida y enviada por correo electrónico' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
module.exports = userCtrl; // Exportamos el controlador para usarlo en las rutas