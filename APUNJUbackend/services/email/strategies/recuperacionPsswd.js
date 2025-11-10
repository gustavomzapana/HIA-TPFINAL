const fs = require('fs');
const path = require('path');
const BaseEmailStrategy = require('./baseStrategy');

class RecuperacionPsswd extends BaseEmailStrategy {
    getEmailOptions() {
        // Ruta al template de recuperación de contraseña
        const templatePath = path.join(__dirname, '../../../templates/mensajeRecuperacion.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Reemplazos en el template
        html = html.replace('{{nombre}}', this.data.nombre);
        html = html.replace('{{email}}', this.data.email);

        return {
            from: `"APUNJU" <${process.env.EMAIL_USER}>`,
            to: this.data.email,
            subject: '✅ Restablecimiento de Contraseña - APUNJU',
            html: html
        };
    }
}

module.exports = RecuperacionPsswd;