const { Inscripcion, Actividad, Pago, sequelize } = require('../models');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { Op } = require('sequelize');

const inscripcionController = {};

// Configurar MercadoPago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// Validar datos de inscripción
const validarDatosInscripcion = (datos) => {
    const errores = [];

    // Validar campos obligatorios
    if (!datos.nombre || datos.nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!datos.apellido || datos.apellido.trim().length < 2) {
        errores.push('El apellido debe tener al menos 2 caracteres');
    }

    if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        errores.push('Email inválido');
    }

    if (!datos.telefono || !/^\d{8,15}$/.test(datos.telefono.replace(/\s+/g, ''))) {
        errores.push('Teléfono inválido (8-15 dígitos)');
    }

    if (!datos.dni || !/^\d{7,8}$/.test(datos.dni)) {
        errores.push('DNI inválido (7-8 dígitos)');
    }

    if (!datos.fechaNacimiento) {
        errores.push('Fecha de nacimiento requerida');
    } else {
        const fechaNac = new Date(datos.fechaNacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNac.getFullYear();
        if (edad < 16 || edad > 100) {
            errores.push('Debe tener entre 16 y 100 años');
        }
    }

    // CAMBIO: NO VALIDAR NÚMERO DE AFILIADO - se toma automáticamente
    // El número de afiliado se maneja en el frontend y se pasa automáticamente

    return errores;
};

// Verificar inscripción duplicada
inscripcionController.verificarDuplicado = async (req, res) => {
    try {
        const { email, dni, actividadId } = req.query;

        const duplicado = await Inscripcion.findOne({
            where: {
                [Op.or]: [
                    { email, actividadId },
                    { dni, actividadId }
                ]
            }
        });

        if (duplicado) {
            return res.status(409).json({
                isDuplicate: true,
                message: `Ya existe una inscripción con ${duplicado.email === email ? 'ese email' : 'ese DNI'} para esta actividad`,
                inscripcion: {
                    nombre: duplicado.nombre,
                    apellido: duplicado.apellido,
                    email: duplicado.email,
                    estado: duplicado.estado,
                    fechaInscripcion: duplicado.fechaInscripcion
                }
            });
        }

        res.json({ isDuplicate: false });
    } catch (error) {
        console.error('Error verificando duplicado:', error);
        res.status(500).json({ message: 'Error al verificar inscripción' });
    }
};

// Crear inscripción
inscripcionController.crearInscripcion = async (req, res) => {
    try {
        console.log('=== CREAR INSCRIPCIÓN ===');
        console.log('Datos recibidos:', req.body);

        const datosInscripcion = { ...req.body };

        // CAMBIO: Si es afiliado y no tiene número de afiliado, usar "AFILIADO_AUTO"
        if (datosInscripcion.esAfiliado && !datosInscripcion.numeroAfiliado) {
            datosInscripcion.numeroAfiliado = 'AFILIADO_AUTO';
            console.log('Número de afiliado establecido automáticamente');
        }

        // Validar datos
        const errores = validarDatosInscripcion(datosInscripcion);
        if (errores.length > 0) {
            console.log('Errores de validación:', errores);
            return res.status(400).json({
                message: 'Errores de validación',
                errores
            });
        }

        // Verificar que la actividad existe y está activa
        const actividad = await Actividad.findByPk(datosInscripcion.actividadId);
        if (!actividad || !actividad.activo) {
            return res.status(404).json({
                message: 'Actividad no encontrada o no disponible'
            });
        }

        // Verificar cupos específicos antes de crear inscripción
        const cuposSuficientes = datosInscripcion.esAfiliado ?
            actividad.cuposAfiliados > 0 :
            actividad.cuposNoAfiliados > 0;

        if (!cuposSuficientes) {
            return res.status(400).json({
                message: `No hay cupos disponibles para ${datosInscripcion.esAfiliado ? 'afiliados' : 'no afiliados'}`
            });
        }

        // Verificar duplicados
        const duplicado = await Inscripcion.findOne({
            where: {
                [Op.or]: [
                    { email: datosInscripcion.email, actividadId: datosInscripcion.actividadId },
                    { dni: datosInscripcion.dni, actividadId: datosInscripcion.actividadId }
                ]
            }
        });

        if (duplicado) {
            return res.status(409).json({
                message: 'Ya estás inscripto en esta actividad',
                inscripcionExistente: {
                    nombre: duplicado.nombre,
                    apellido: duplicado.apellido,
                    estado: duplicado.estado,
                    fechaInscripcion: duplicado.fechaInscripcion
                }
            });
        }

        // Preparar datos de inscripción
        const nuevaInscripcion = {
            ...datosInscripcion,
            nombreActividad: actividad.nombreCurso,
            tipoActividad: actividad.tipoActividad,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Iniciar transacción para garantizar consistencia
        const t = await sequelize.transaction();

        try {
            nuevaInscripcion.estado = 'confirmada';

            // 1. Crear inscripción
            const inscripcion = await Inscripcion.create(nuevaInscripcion, { transaction: t });

            console.log('Inscripción guardada:', inscripcion.id);

            // 2. Descontar cupos de la actividad
            const campoActualizar = datosInscripcion.esAfiliado ? 'cuposAfiliados' : 'cuposNoAfiliados';
            
            await Actividad.decrement(
                campoActualizar, 
                { 
                    by: 1,
                    where: { id: datosInscripcion.actividadId },
                    transaction: t 
                }
            );

            console.log(`Cupo descontado: ${datosInscripcion.esAfiliado ? 'afiliado' : 'no afiliado'}`);

            // Confirmar transacción
            await t.commit();

            return res.status(201).json({
                success: true,
                message: 'Inscripción completada exitosamente',
                inscripcion: {
                    id: inscripcion.id,
                    nombre: inscripcion.nombre,
                    apellido: inscripcion.apellido,
                    email: inscripcion.email,
                    estado: inscripcion.estado,
                    esAfiliado: inscripcion.esAfiliado,
                    numeroAfiliado: inscripcion.numeroAfiliado,
                    fechaInscripcion: inscripcion.fechaInscripcion,
                    pagoId: inscripcion.pagoId,
                    metodoDePago: inscripcion.metodoDePago
                }
            });
        } catch (transactionError) {
            // Revertir transacción en caso de error
            await t.rollback();
            console.error('Error en transacción:', transactionError);
            throw transactionError;
        }

    } catch (error) {
        console.error('Error completo al crear inscripción:', error);

        // Sequelize unique constraint error
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Ya estás inscripto en esta actividad'
            });
        }

        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener inscripciones del usuario
inscripcionController.obtenerInscripcionesUsuario = async (req, res) => {
    try {
        const { email } = req.query;

        const inscripciones = await Inscripcion.findAll({
            where: { email },
            include: [
                {
                    model: Actividad,
                    as: 'actividad'
                }
            ],
            order: [['fechaInscripcion', 'DESC']]
        });

        res.json(inscripciones);
    } catch (error) {
        console.error('Error obteniendo inscripciones:', error);
        res.status(500).json({ message: 'Error al obtener inscripciones' });
    }
};

// Obtener inscripción por ID
inscripcionController.obtenerInscripcionPorId = async (req, res) => {
    try {
        const inscripcion = await Inscripcion.findByPk(req.params.id, {
            include: [
                {
                    model: Actividad,
                    as: 'actividad'
                },
                {
                    model: Pago,
                    as: 'pago'
                }
            ]
        });

        if (!inscripcion) {
            return res.status(404).json({ message: 'Inscripción no encontrada' });
        }

        res.json(inscripcion);
    } catch (error) {
        console.error('Error obteniendo inscripción:', error);
        res.status(500).json({ message: 'Error al obtener inscripción' });
    }
};

// Cancelar inscripción
inscripcionController.cancelarInscripcion = async (req, res) => {
    try {
        const [updated] = await Inscripcion.update(
            { estado: 'cancelada' },
            { where: { id: req.params.id } }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Inscripción no encontrada' });
        }

        const inscripcion = await Inscripcion.findByPk(req.params.id);

        res.json({
            message: 'Inscripción cancelada exitosamente',
            inscripcion
        });
    } catch (error) {
        console.error('Error cancelando inscripción:', error);
        res.status(500).json({ message: 'Error al cancelar inscripción' });
    }
};


inscripcionController.obtenerInscripcionesPorActividad = async (req, res) => {
    try {
        const { actividadId } = req.params;

        console.log('Obteniendo inscripciones para actividad:', actividadId);

        const inscripciones = await Inscripcion.findAll({
            where: { actividadId },
            include: [
                {
                    model: Actividad,
                    as: 'actividad',
                    attributes: ['nombreCurso', 'tipoActividad', 'precioNoAfiliado']
                },
                {
                    model: Pago,
                    as: 'pago'
                }
            ],
            order: [['fechaInscripcion', 'DESC']]
        });

        console.log(`Se encontraron ${inscripciones.length} inscripciones`);

        // Formatear datos para Excel
        const datosParaExcel = inscripciones.map((inscripcion) => ({
            nombre: inscripcion.nombre,
            apellido: inscripcion.apellido,
            email: inscripcion.email,
            telefono: inscripcion.telefono,
            dni: inscripcion.dni,
            fechaNacimiento: inscripcion.fechaNacimiento,
            esAfiliado: inscripcion.esAfiliado,
            numeroAfiliado: inscripcion.numeroAfiliado,
            estado: inscripcion.estado,
            estadoPago: inscripcion.estadoPago,
            montoPagado: inscripcion.esAfiliado ? 0 : inscripcion.montoPagado,
            fechaInscripcion: inscripcion.fechaInscripcion,
            nombreActividad: inscripcion.actividad?.nombreCurso || inscripcion.nombreActividad,
            tipoActividad: inscripcion.actividad?.tipoActividad || inscripcion.tipoActividad
        }));

        res.json({
            success: true,
            data: datosParaExcel,
            actividad: inscripciones.length > 0 ? {
                nombre: inscripciones[0].actividad?.nombreCurso || inscripciones[0].nombreActividad,
                tipo: inscripciones[0].actividad?.tipoActividad || inscripciones[0].tipoActividad
            } : null,
            totalInscripciones: inscripciones.length,
            resumen: {
                totalAfiliados: inscripciones.filter(i => i.esAfiliado).length,
                totalNoAfiliados: inscripciones.filter(i => !i.esAfiliado).length,
                totalPagados: inscripciones.filter(i => i.estadoPago === 'pagado').length,
                totalPendientes: inscripciones.filter(i => i.estadoPago === 'pendiente').length,
                montoTotal: inscripciones.reduce((total, i) =>
                    total + (i.esAfiliado ? 0 : i.montoPagado || 0), 0)
            }
        });

    } catch (error) {
        console.error('Error obteniendo inscripciones para Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener inscripciones para Excel',
            error: error.message
        });
    }
};

module.exports = inscripcionController;