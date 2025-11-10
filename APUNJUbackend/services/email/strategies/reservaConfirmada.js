const fs = require('fs');
const path = require('path');
const BaseEmailStrategy = require('./baseStrategy');



class SaludoCumpleaños extends BaseEmailStrategy {
    getEmailOptions() {
        // Cargar la plantilla HTML del saludo de cumpleaños
        const templatePath = path.join(__dirname, '../../../templates/mensajeReservaConfirmada.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        html = html.replace('{{nombreCliente}}', this.data.nombreCliente);

        // Reemplazar la variable de nombre en el HTML

        // Retornar las opciones del correo electrónico
        return {
            from: `"APUNJU" <${process.env.EMAIL_USER}>`, // Remitente del correo
            to: this.data.email, // Destinatario del correo
            subject: '¡Reserva Realizada con exito!', // Asunto 
            html: html, // Contenido HTML del correo
            attachments: this.data.pdfBuffer ? [{
                filename: `comprobante-reserva-${this.data.numeroReserva}.pdf`,
                content: this.data.pdfBuffer,
                contentType: 'application/pdf'
            }] : []
        };
    }
}
module.exports = SaludoCumpleaños;