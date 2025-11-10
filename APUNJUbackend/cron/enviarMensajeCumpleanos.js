const cron = require('node-cron');
const Usuario = require('../models/usuario');
const { enviarCorreo } = require('../services/email/emailService');

// Función para obtener el día/mes actual en formato DD/MM
function getHoyDiaMes() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
}

// Función principal para verificar y enviar correos de cumpleaños
async function checkCumpleanos() {
    const diaMes = getHoyDiaMes();

    try {
        console.log(`🎂 Verificando cumpleaños para: ${diaMes}`);

        const cumpleañeros = await Usuario.find({
            esAfiliado: true,
            fNacimiento: {
                $regex: `^${diaMes}`
            }
        });

        if (cumpleañeros.length === 0) {
            console.log('No hay cumpleaños de afiliados hoy');
            return;
        }

        console.log(`Enviando ${cumpleañeros.length} correos de cumpleaños`);

        let exitosos = 0;
        let errores = 0;

        for (const usuario of cumpleañeros) {
            try {
                await enviarCorreo('saludoCumpleaños', {
                    nombre: usuario.nombre,
                    email: usuario.email
                });

                console.log(`✅ Correo enviado a: ${usuario.email}`);
                exitosos++;

            } catch (emailError) {
                console.error(`❌ Error enviando a ${usuario.email}:`, emailError.message);
                errores++;
            }
        }

        console.log(`🎉 Proceso completado - Exitosos: ${exitosos}, Errores: ${errores}`);

    } catch (error) {
        console.error('Error en verificación de cumpleaños:', error.message);
    }
}

// Programar cron para ejecutar todos los días a las 9:00 AM (hora de Argentina)
cron.schedule('59 11 * * *', async () => {
    await checkCumpleanos();
}, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires"
});

console.log('✅ Cron de cumpleaños configurado - Se ejecuta diariamente a las 9:00 AM');