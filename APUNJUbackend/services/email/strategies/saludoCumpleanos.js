const fs = require('fs');
const path = require('path');
const BaseEmailStrategy = require('./baseStrategy');



class SaludoCumpleaños extends BaseEmailStrategy {
    getEmailOptions() {
        // Cargar la plantilla HTML del saludo de cumpleaños
        const templatePath = path.join(__dirname, '../../../templates/mensajeCumpleanos.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        html = html.replace('{{nombre}}', this.data.nombre);

        // Reemplazar la variable de nombre en el HTML

        // Retornar las opciones del correo electrónico
        return {
            from: `"APUNJU" <${process.env.EMAIL_USER}>`, // Remitente del correo
            to: this.data.email, // Destinatario del correo
            subject: '🎉¡Muy Feliz Cumpleaños!', // Asunto 
            html: html // Contenido HTML del correo
        }
    }
}
module.exports = SaludoCumpleaños;