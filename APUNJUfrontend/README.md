# Proyfrontendgrupo01

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

PROYECTO GRUPAL - GRUPO 01

1. URL de la Aplicación Desplegada
   - Frontend: https://proyfrontendgrupo01.onrender.com
   - Documentación de Endpoints: https://documenter.getpostman.com/view/39424593/2sB34eHh2k

2. Guía de Instalación

   Requisitos Previos:
   - Node.js (v16 o superior)
   - npm (v8 o superior)
   - Angular CLI (v19 o superior)
   - MongoDB (local o Atlas)
   - Cuenta en Cloudinary (para almacenamiento de imágenes)
   - Cuenta en MercadoPago (para pagos)

   Pasos para la instalación:

   URLs de los Repositorios:
   - Frontend: https://github.com/IsNicolasB/proyfrontendgrupo01.git
     
Frontend (proyfrontendgrupo01):
    1. Clonar el repositorio del frontend (si aún no lo ha hecho)
    2. Navegar al directorio del frontend:
        cd proyfrontendgrupo01
    3. Instalar dependencias:
        npm install
    4. Configuración del entorno:
        - Abrir el archivo `src/environments/environment.ts`
        - Asegurarse de que la configuración sea similar a esta:
            ```
            export const environment = {
            production: false,
            apiUrl: 'https://proybackendgrupo01.onrender.com'  // URL del backend desplegado
            };
            ```
        - Para producción (environment.prod.ts), usar la misma URL del backend
    5. Instalar Angular CLI globalmente (si no lo tiene):
        npm install -g @angular/cli@19.2.9
    6. Instalar dependencias específicas (si es necesario):
        npm install @angular/material @angular/cdk @angular/animations
        npm install bootstrap@5.3.0 bootstrap-icons
        npm install ngx-toastr
    7. Iniciar la aplicación en modo desarrollo:
        ng serve
    8. Abrir en el navegador:
        http://localhost:4200
    9. Para producción, compilar con:
        ng build --configuration production
Despliegue del Frontend en Render (Static Site):
    1. Crear una cuenta en Render.com
    2. Seleccionar "New" y luego "Static Site"
    3. Conectar con el repositorio de GitHub: https://github.com/IsNicolasB/proyfrontendgrupo01.git
    4. Configurar el despliegue:
        - Name: proyfrontendgrupo01
        - Branch: main
        - Build Command: npm install --legacy-peer-deps && npm run build -- --configuration=production
        - Publish directory: dist/proyfrontendgrupo01/browser
    5. Hacer clic en "Create Static Site"
    6. Una vez finalizado el despliegue, la URL estará disponible en el dashboard

3. Almacenamiento Utilizado:
   - Base de datos: MongoDB (Atlas) mongodb+srv://gaston04gutierrez:zL1I2y9DV5f0L5s6@pyswgrupo1db.auhjsht.mongodb.net/
   - Almacenamiento de archivos: Cloudinary
   - Autenticación: JWT (JSON Web Tokens)
   - Pagos: MercadoPago
   - Correos: Servicio SMTP configurado

4. Características Principales:
   - Autenticación de usuarios
   - Gestión de perfiles
   - Subida de imágenes a Cloudinary
   - Sistema de pagos con MercadoPago
   - Generación de reportes en PDF y Excel
   - Panel de administración
   - Diseño responsivo con Angular Material y Bootstrap

5. Soporte:
   Para problemas técnicos, por favor abra un issue en el repositorio correspondiente o contacte al equipo de desarrollo.
