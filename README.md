# Reality Transurfing · Academia de estudio

Aplicación estática, en español, para estudiar conceptos de los cinco tomos de Vadim Zeland y realizar **ejercicios didácticos propios**. Incluye 167 actividades, un diario local y 78 cartas de reflexión.

## Uso y límites de la fuente

El proyecto distingue entre:
- **Concepto atribuido a Zeland:** lo que sostiene el autor en su marco metafísico. No es una afirmación científicamente demostrada.
- **Procedimiento descrito en el libro:** debe conservar sus componentes reconocibles y su localizador.
- **Adaptación editorial:** pasos, ejemplos, plazos y pautas propuestos por esta Academia.
- **Observación personal:** el contenido del diario no prueba causalidad sobrenatural ni garantiza resultados externos.

Fuente contrastada: compilación local en español `Reality Transurfing Completo 1 2 3 4 5.pdf` de **585 páginas físicas**. La numeración de pantalla corresponde a esas páginas físicas, no necesariamente a las páginas impresas. El PDF no se distribuye en este repositorio.

La auditoría de 8 de noviembre de 2026 inventarió 167 fichas, con **45 cotejos focales y 122 revisiones parciales**; ninguna estaba certificada con una revisión integral frase por frase. Los localizadores en `fidelity-map.js` y los 134 apartados de `original-index.js` permiten consultar los pasajes, pero no deben presentarse como una certificación. No existe aquí cotejo con el manual independiente de las 78 cartas, por lo que sus interpretaciones y pautas siguen etiquetadas como editoriales.

## Ejecución local

Abrir `index.html` en un navegador moderno o servir la carpeta con un servidor estático. Las rutas internas usan fragmentos `#`, compatibles con GitHub Pages. No hay backend propio. Los datos privados del diario se guardan en el almacenamiento local del navegador, no se envían a un servidor de la aplicación.

La exportación JSON desde **Diario** permite conservar una copia de seguridad. No se recomienda depender de un único navegador para guardar un diario a largo plazo. Si el navegador no permite guardar, la aplicación debe informar de ello; comprueba las copias periódicamente.

## Pruebas

Requiere Node.js 22+ y Chrome/Chromium para la prueba de navegador.

```sh
node tests/audit.mjs
node tests/browser-smoke.mjs
```

En Windows puede definirse `CHROME_PATH` si Chrome no está en las rutas habituales. GitHub Actions comprueba ambas suites antes de publicar la web. El navegador de pruebas usa datos sintéticos; no debe usar el perfil personal habitual.

Las pruebas automatizadas no sustituyen una revisión semántica del PDF, una auditoría WCAG integral ni la comprobación en dispositivos físicos.

## Archivos principales

- `index.html`: interfaz base, datos del volumen I y exportación/importación.
- `volume2.js`, `volumes345.js`: contenidos de los volúmenes II a V.
- `study-plus.js`: protocolos, formularios ampliados y diarios.
- `oracle.js`: cartas y consultas editoriales.
- `source-guide.js`: índice temático y glosario.
- `fidelity-map.js`: referencia PDF por actividad y estado de cotejo pendiente.
- `original-index.js`: subsecciones de la compilación, con sus rangos.
- `router.js`: enlaces directos e historial de navegación.

**Aviso:** ninguna práctica del proyecto sustituye atención sanitaria, decisiones informadas ni el consentimiento de otras personas.
