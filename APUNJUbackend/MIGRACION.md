# 🔄 Guía de Migración de MongoDB a MariaDB

## ✅ Cambios Realizados

### 1. Modelos Convertidos
Todos los modelos han sido migrados de Mongoose a Sequelize:
- ✅ Usuario
- ✅ Recurso  
- ✅ Reserva
- ✅ Fecha
- ✅ Actividad (con discriminadores Curso, Taller, Capacitación)
- ✅ Inscripción
- ✅ Pago
- ✅ Cuota
- ✅ Noticia

### 2. Archivos Modificados
- ✅ `config/database.js` - Configuración de Sequelize
- ✅ `models/*.js` - Todos los modelos convertidos
- ✅ `models/index.js` - Archivo con relaciones (NUEVO)
- ✅ `index.js` - Conexión y sincronización
- ✅ `package.json` - Dependencias actualizadas
- ✅ `.env` - Variables de MariaDB agregadas
- ✅ `config/init-database.js` - Script de inicialización

---

## 📋 Pasos Siguientes

### Paso 1: Instalar MariaDB
Descarga e instala MariaDB desde: https://mariadb.org/download/

### Paso 2: Crear la base de datos
Abre el cliente de MariaDB y ejecuta:
```sql
CREATE DATABASE apunju_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Paso 3: Configurar credenciales en .env
Edita el archivo `.env` con tus credenciales de MariaDB:
```env
DB_NAME=apunju_db
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_HOST=localhost
DB_PORT=3306
```

### Paso 4: Instalar dependencias
```bash
npm uninstall mongoose
npm install sequelize mariadb --save
```

### Paso 5: Inicializar base de datos
```bash
node config/init-database.js
```

Esto creará todas las tablas necesarias.

---

## 🔧 Cambios Necesarios en Controladores y Servicios

### Principales Diferencias de Sintaxis

#### Buscar por ID
```javascript
// ❌ Mongoose
const user = await User.findById(id);

// ✅ Sequelize
const user = await Usuario.findByPk(id);
```

#### Buscar con filtros
```javascript
// ❌ Mongoose
const users = await User.find({ activo: true });

// ✅ Sequelize
const users = await Usuario.findAll({ where: { activo: true } });
```

#### Buscar uno
```javascript
// ❌ Mongoose
const user = await User.findOne({ email: 'test@test.com' });

// ✅ Sequelize
const user = await Usuario.findOne({ where: { email: 'test@test.com' } });
```

#### Crear
```javascript
// ❌ Mongoose
const user = new User(data);
await user.save();

// ✅ Sequelize
const user = await Usuario.create(data);
```

#### Actualizar
```javascript
// ❌ Mongoose
const user = await User.findByIdAndUpdate(id, data, { new: true });

// ✅ Sequelize
await Usuario.update(data, { where: { id } });
const user = await Usuario.findByPk(id);
```

#### Eliminar (soft delete)
```javascript
// ❌ Mongoose
await User.findByIdAndUpdate(id, { activo: false });

// ✅ Sequelize
await Usuario.update({ activo: false }, { where: { id } });
```

#### Eliminar permanente
```javascript
// ❌ Mongoose
await User.findByIdAndDelete(id);

// ✅ Sequelize
await Usuario.destroy({ where: { id } });
```

#### Populate / Include
```javascript
// ❌ Mongoose
const reserva = await Reserva.findById(id)
  .populate('userId')
  .populate('resourceId');

// ✅ Sequelize
const reserva = await Reserva.findByPk(id, {
  include: [
    { model: Usuario, as: 'usuario' },
    { model: Recurso, as: 'recurso' }
  ]
});
```

#### Excluir campos
```javascript
// ❌ Mongoose
const users = await User.find().select('-password');

// ✅ Sequelize
const users = await Usuario.findAll({
  attributes: { exclude: ['password'] }
});
```

#### Buscar con operadores
```javascript
const { Op } = require('sequelize');

// ❌ Mongoose
const users = await User.find({ 
  edad: { $gte: 18, $lte: 65 } 
});

// ✅ Sequelize
const users = await Usuario.findAll({
  where: {
    edad: { 
      [Op.gte]: 18,
      [Op.lte]: 65
    }
  }
});
```

#### Transacciones (NUEVO en Sequelize)
```javascript
const t = await sequelize.transaction();

try {
  const pago = await Pago.create(pagoData, { transaction: t });
  const reserva = await Reserva.create({
    ...reservaData,
    pagoId: pago.id
  }, { transaction: t });
  
  await t.commit();
  return reserva;
} catch (error) {
  await t.rollback();
  throw error;
}
```

---

## 🔍 Archivos que Debes Actualizar

### Controladores
- `controllers/usuario.controller.js` - Cambiar `_id` por `id`
- `controllers/recurso.controller.js` - Actualizar queries
- `controllers/reserva.controller.js` - Actualizar populate por include
- `controllers/actividad.controller.js` - Actualizar queries
- `controllers/inscripcion.controller.js` - Actualizar queries
- `controllers/pago.controller.js` - Actualizar queries
- `controllers/fecha.controller.js` - Actualizar queries
- `controllers/noticia.controller.js` - Actualizar queries

### Servicios
- `services/usuario.service.js` - Actualizar métodos
- `services/reserva.service.js` - Actualizar queries y populate
- `services/autenticacion.service.js` - Actualizar validaciones

### Repositorios
- `repositories/usuario.repository.js` - Actualizar todos los métodos

### Cron Jobs
- `cron/check-reserva.js` - Actualizar queries
- `cron/enviarMensajeCumpleanos.js` - Actualizar queries

---

## 🚨 Puntos Importantes

### IDs
- MongoDB usa `_id` (ObjectId)
- MariaDB usa `id` (INTEGER AUTO_INCREMENT)
- **Todos los `_id` deben cambiar a `id`**

### Timestamps
Sequelize agrega automáticamente:
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización

### JSON Fields
Los campos que eran arrays en MongoDB ahora son JSON:
- `caracteristicas` en Recurso
- `precios` en Recurso
- `materiales` en Actividad
- `cuotas` en Pago (ahora es una relación 1:N)

### Relación Reserva-Fechas
En MongoDB era un array de referencias. En MariaDB es una relación 1:N donde Fecha tiene `reservaId`.

---

## 📊 Operadores de Sequelize

```javascript
const { Op } = require('sequelize');

// Comparación
[Op.eq]: valor          // =
[Op.ne]: valor          // !=
[Op.gt]: valor          // >
[Op.gte]: valor         // >=
[Op.lt]: valor          // <
[Op.lte]: valor         // <=

// Patrones
[Op.like]: '%valor%'    // LIKE
[Op.notLike]: '%valor%' // NOT LIKE
[Op.iLike]: '%valor%'   // ILIKE (case insensitive)

// Arrays
[Op.in]: [1, 2, 3]      // IN
[Op.notIn]: [1, 2, 3]   // NOT IN

// Lógicos
[Op.and]: [{...}, {...}]  // AND
[Op.or]: [{...}, {...}]   // OR
[Op.not]: {...}           // NOT

// Especiales
[Op.between]: [1, 10]     // BETWEEN
[Op.notBetween]: [1, 10]  // NOT BETWEEN
[Op.is]: null             // IS NULL
[Op.isNot]: null          // IS NOT NULL
```

---

## 🔄 Ejemplo de Migración de un Controlador

### Antes (Mongoose)
```javascript
const User = require('../models/usuario');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ activo: true })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Después (Sequelize)
```javascript
const { Usuario } = require('../models');

exports.getUsers = async (req, res) => {
  try {
    const users = await Usuario.findAll({
      where: { activo: true },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## ✅ Checklist de Migración

- [x] Instalar MariaDB
- [x] Crear base de datos
- [x] Configurar .env
- [x] Instalar dependencias (sequelize, mariadb)
- [x] Convertir modelos
- [x] Definir relaciones
- [x] Actualizar index.js
- [ ] Actualizar todos los controladores
- [ ] Actualizar todos los servicios
- [ ] Actualizar repositorios
- [ ] Actualizar cron jobs
- [ ] Probar cada endpoint
- [ ] Migrar datos de MongoDB a MariaDB (si es necesario)

---

## 🛠️ Herramientas Útiles

### Cliente de MariaDB
- HeidiSQL: https://www.heidisql.com/
- DBeaver: https://dbeaver.io/
- phpMyAdmin: https://www.phpmyadmin.net/

### Extensiones de VS Code
- MySQL (by cweijan)
- SQL Formatter
- Sequelize Snippets

---

## 📞 Soporte

Si encuentras algún error durante la migración, revisa:
1. Las credenciales en `.env`
2. Que MariaDB esté corriendo
3. Los logs de consola al iniciar el servidor
4. Los nombres de las relaciones en los include

¡Buena suerte con la migración! 🚀
