const Usuario = require("../models/usuario");
const { Op } = require('sequelize');

const userRepository = {
  //CrearUsuario
  createUser: async (userData) => {
    console.log("llego al repositorio:", userData);
    const user = await Usuario.create(userData);
    console.log("se procede a guardar existosamente");
    return user;
  },
  
  //obtener todos los usuarios
  getAllUsers: async () => {
    return await Usuario.findAll({ 
      where: { activo: true },
      attributes: { exclude: ['password'] }
    });
  },
  
  // Obtener Usuario por Id
  getUserById: async (id) => {
    return await Usuario.findByPk(id);
  },
  
  //Obtener Usuario por legajo
  getUserByLegajo: async (legajo) => {
    return await Usuario.findOne({ where: { legajo } });
  },
  
  //Obtener Usuario por Dni
  getUserByDni: async (dni) => {
    return await Usuario.findOne({ where: { dni } });
  },
  
  //obtener Usuario por email
  getUserByEmail: async (email) => {
    return await Usuario.findOne({ where: { email } });
  },
  
  // Actualizar Usuario
  updateUser: async (id, userData) => {
    await Usuario.update(userData, { where: { id } });
    return await Usuario.findByPk(id);
  },

  // Eliminar Usuario por Id de manera lógica
  deleteUser: async (id) => {
    await Usuario.update({ activo: false }, { where: { id } });
    return await Usuario.findByPk(id);
  },
  
  getUsersByDependency: async (dependencia) => {
    //devuelve la lista de usuarios de acuerdo a sus dependencias, insensible a las mayusculas/minusculas
    return await Usuario.findAll({
      where: {
        dependencia: {
          [Op.like]: dependencia
        },
        activo: true
      },
      attributes: { exclude: ['password'] }
    });
  },
  
  getDesafiliados: async () => {
    // Usuarios que son afiliados pero NO están activos
    return await Usuario.findAll({
      where: { 
        rol: "Afiliado", 
        activo: false 
      },
      attributes: { exclude: ['password'] }
    });
  },
  
  getInvitados: async () => {
    // Usuarios que son invitados y están activos
    return await Usuario.findAll({
      where: { 
        rol: "Invitado", 
        activo: true 
      },
      attributes: { exclude: ['password'] }
    });
  },
};

module.exports = userRepository;
