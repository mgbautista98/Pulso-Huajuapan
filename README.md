# Pulso Huajuapan

Aplicación local para construir un directorio propio de negocios de Huajuapan de León. Usa Python, Flask y SQLite; los datos permanecen en `data/pulso_huajuapan.db` y no se suben a GitHub.

## Instalar en otra computadora

1. Instala Python 3.11 o posterior.
2. Descarga o clona este repositorio.
3. En macOS, abre `run.command`. En Windows, abre `run.bat`.
4. Visita <http://127.0.0.1:5000> en el navegador.

La primera ejecución crea el entorno, instala Flask y genera la base de datos automáticamente.

## Capturar información

- Usa **Nuevo negocio** para capturar una ficha.
- Pega un enlace largo de Google Maps que contenga coordenadas, o selecciona el punto directamente en el mapa mientras el formulario está abierto.
- Usa **Exportar CSV** para crear un respaldo o **Importar CSV** para cargar muchos registros.
- Los encabezados admitidos están en el CSV exportado: `name`, `category`, `address`, `neighborhood`, `latitude`, `longitude`, `phone`, `schedule`, `price_range`, `responsible`, `source`, `verified_at`, `notes`, `needs`.

## Sobre Google Maps

La aplicación permite capturar manualmente información que hayas verificado. No extrae automáticamente fichas de Google Maps. Para automatizarlo más adelante se debe utilizar la API oficial de Google Places y respetar sus condiciones de uso.

## Sitio de demostración

La carpeta `dist/` contiene el prototipo visual publicado. La aplicación local de captura vive en `app.py`, `templates/` y `static/`.
