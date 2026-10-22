# Calendario de servicios

Proyecto de Jeremías Rivelli / JerePrograma, preparado para la galería de Scalaris bajo `/calendario-servicios/`.

Permite calcular jornadas 12×36, 24×48 y 48×96 desde el primer día elegido hasta el 31 de diciembre, agregar notas temporales y guardar el mes visible como PDF. No tiene backend, anuncios, analítica, pagos ni persistencia de anotaciones. Los cálculos y la exportación se ejecutan en el navegador.

## Construcción y controles

Requiere Node.js 24 y npm. Desde este repositorio:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm audit --omit=dev --audit-level=high
npm test
npm run build
npm run check
```

Publicar **únicamente `dist/`**. Esa carpeta contiene HTML, CSS, JavaScript, módulos de calendario/PDF, un logo, cuatro bibliotecas locales, sus licencias y `deployment.json` con versiones y hashes. No publicar la raíz del repositorio, `node_modules`, el CNAME histórico ni la copia antigua de FullCalendar.

Los recursos usan rutas relativas, por lo que funcionan al servir el contenido de `dist/` en `/calendario-servicios/`. Redirigir `/calendario-servicios` a la ruta con barra final. El servidor debe enviar `.js` y `.mjs` con tipo MIME de JavaScript.

Alternativa Docker para exportar la misma distribución:

```sh
docker build --target static --build-arg SOURCE_COMMIT=COMMIT --output type=local,dest=build-output .
```

Publicar `build-output/dist/`. El argumento `SOURCE_COMMIT` es la revisión Git del código, no un secreto.

El despliegue del VPS usa `docker compose -f deployment/vps/compose.yaml up -d --build`. El contenedor Nginx sin privilegios sirve sólo la distribución y escucha en `127.0.0.1:18094`, con límite de 64 MB. Caddy lo alcanza por la red externa `proxy`, alias `calendario-demo-web:8080`.

## Dependencias

`package-lock.json` fija el contenido desde el registro npm. El build copia FullCalendar 6.1.22 (incluida la traducción española), html2canvas 1.4.1 y jsPDF 4.2.1. No carga bibliotecas de CDN en tiempo de ejecución.

La API UMD actual de jsPDF se utiliza mediante `window.jspdf.jsPDF`. jsPDF 4.2.1 corrige la vulnerabilidad crítica documentada por el proyecto en [GHSA-wfv2-pwc8-crg5](https://github.com/parallax/jsPDF/security/advisories/GHSA-wfv2-pwc8-crg5). Una auditoría sin hallazgos corresponde al momento en que se ejecuta; repetirla antes de futuras publicaciones.

## Corrección de fechas

Se calculan fechas de calendario en UTC, sin cambios por la zona horaria del dispositivo. El esquema 48×96 conserva dos días de trabajo por ciclo, pero corta en el 31 de diciembre incluso si el segundo día cae en enero. Las fechas imposibles se rechazan. Recalcular reemplaza las jornadas y notas anteriores, como en la aplicación original.
