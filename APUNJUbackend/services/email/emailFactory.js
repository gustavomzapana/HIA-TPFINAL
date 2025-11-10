const SaludoCumpleaños = require('./strategies/saludoCumpleanos');
const CreacionCuenta = require('./strategies/creacionCuenta');
const CambioContrasenia = require('./strategies/cambioContrasenia');
const RecuperacionPsswd = require('./strategies/recuperacionPsswd');
const ReservaConfirmada = require('./strategies/reservaConfirmada');

function emailFactory(type, data) {
    switch (type) {
        case 'saludoCumpleaños':
            return new SaludoCumpleaños(data);
            break;
        case 'creacionCuenta':
            return new CreacionCuenta(data);
            break;
        case 'cambioContrasenia':
            return new CambioContrasenia(data);
            break;
        case 'recuperacionContrasenia':
            return new RecuperacionPsswd(data);
            break;
        case 'reservaConfirmada':
            return new ReservaConfirmada(data);
            break;
        // Aquí puedes agregar más tipos de correos electrónicos según sea necesario
        // case 'otroTipo':
        //     return new OtroTipo(data);
        //     break;
        default:
            throw new Error(`Email type ${type} not supported`);
    }
}
module.exports = emailFactory;