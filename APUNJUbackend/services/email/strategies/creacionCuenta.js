const fs = require('fs');
const path = require('path');
const BaseEmailStrategy = require('./baseStrategy');

class CreacionCuenta extends BaseEmailStrategy {
    getEmailOptions() {
        // Ruta al template de creación de cuenta
        const templatePath = path.join(__dirname, '../../../templates/mensajeCreacionCuenta.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Reemplazos en el template
        html = html.replace('{{nombre}}', this.data.nombre);
        html = html.replace('{{email}}', this.data.email);

        return {
            from: `"APUNJU" <${process.env.EMAIL_USER}>`,
            to: this.data.email,
            subject: '✅ Tu cuenta fue creada con éxito',
            html: html
        };
    }
}

module.exports = CreacionCuenta;