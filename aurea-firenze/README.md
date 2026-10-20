# Aurea Firenze — sitio web demostrativo

Web responsive para restaurante de inspiración renacentista. Interfaz 100% HTML, CSS y JavaScript, sin compilación ni dependencias de código.

## Cómo abrirla

Abre `index.html` con Chrome, Edge, Firefox o Safari. También puedes servir esta carpeta con `python -m http.server 8000` y abrir `http://localhost:8000`.

## Secciones

Recorrido continuo por un palacio italiano, renderizado de forma ilustrativa en Canvas 2D y controlado por scroll, con seis etapas y navegación directa; historia, menú filtrable, platillos de temporada, solicitud de eventos especiales, reseñas navegables, ubicación, redes sociales y modal de solicitudes de reserva.

## Personalización

1. Edita `CONFIG` al comienzo de `script.js`: dirección, horarios, contacto, URL de Google Maps, Instagram, Facebook y TikTok.
2. Para gestionar de verdad las **reservaciones** y **solicitudes de eventos**, conecta `reservationEndpoint` y `eventEndpoint` a un servicio HTTPS propio que reciba JSON y responda HTTP 2xx al aceptar la solicitud. **Por defecto nada se envía ni se almacena en servidores**: se puede copiar la solicitud para compartirla.
3. Sustituye los platos, precios y descripciones del objeto `dishes` en `script.js`, los platillos de temporada del `index.html` y las reseñas ficticias del objeto `reviews` con opiniones reales verificadas y autorizadas.
4. Cambia el nombre ficticio Aurea Firenze por el nombre real de la marca. Los colores se encuentran en las variables `:root` de `styles.css`.
5. Las fotografías gastronómicas se enlazan a imágenes públicas externas de Unsplash y **requieren conexión a Internet**. Para una web de producción conviene descargar imágenes de las que tengas permiso de uso y servirlas desde tu dominio.
6. El cuadro de Botticelli proviene de una reproducción marcada como dominio público en Wikimedia Commons. Fuente: https://commons.wikimedia.org/wiki/File:Birth_of_Venus_Botticelli.jpg. Comprueba licencias de cualquier contenido adicional antes de publicarlo.

## Consideraciones de producción

- Este es un **prototipo frontend**, no una plataforma de reservas en operación: no proporciona disponibilidad real, pasarela de pago ni notificaciones automáticas.
- El recorrido actual es una **representación 3D ilustrada continua**, calculada en Canvas 2D y controlada por scroll. No utiliza videos, imágenes generadas por IA ni servicios sujetos a cargos. Si se requiere la versión **fotorrealista cinematográfica** del plugin `scroll-world`, será necesario generar una cadena de clips con Higgsfield/Monid, presupuestarla, autorizar su costo y enlazarla al motor de reproducción. La versión actual no representa una visita filmada ni el interior real de un restaurante.
- Antes de lanzar: añade datos reales, política de privacidad, consentimiento/aviso para formularios, backend seguro, medidas antispam, validación y configuración de dominio/SSL.
