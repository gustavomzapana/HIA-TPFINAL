const fs = require('fs');
const path = require('path');
const BaseEmailStrategy = require('./baseStrategy');

class CambioContrasenia extends BaseEmailStrategy {
    getEmailOptions() {
        const templatePath = path.join(__dirname, '../../../templates/mensajeCambioContrasenia.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        html = html.replace('{{nombre}}', this.data.nombre || 'Usuario');

        return {
            from: `"APUNJU" <${process.env.EMAIL_USER}>`,
            to: this.data.email,
            subject: '🔐 Contraseña actualizada correctamente',
            html: html
        };
    }
}

module.exports = CambioContrasenia;