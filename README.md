# Terraza 45 – Show Bar del Despecho · Sitio web (preview estática)

**"El 1.er Bar del Despecho en Lima"**: sitio *one-page* estático (HTML + CSS + JavaScript vanilla) listo para **GitHub Pages**.
No usa backend, PHP, base de datos ni proceso de *build*. Es una **demo/preview** del diseño de la propuesta; la versión WordPress autoadministrable se montará después en hosting propio.

- **URL prevista:** https://visualgroup-pe.github.io/terraza45/
- **Paleta:** `#0B0508` negro noche · `#1A0710` vino profundo · `#2A0B18` vino tarjeta · `#D1226A` magenta Terraza (logo) · `#E5173F` rojo pasión · `#FFB547` ámbar neón · `#FFF4EC` crema · `#C9A9B4` rosa humo
- **Tipografías (Google Fonts):** *Playfair Display* (títulos) + *Outfit* (texto)

---

## 1. Estructura del repositorio

```
terraza45/
├── index.html              ← página única (todas las secciones, SEO, JSON-LD, GA4)
├── css/styles.css          ← estilos (mobile-first, comentados por sección)
├── js/
│   ├── config.js           ← ★ teléfono, WhatsApp, dirección y horario (edítalo aquí)
│   └── main.js             ← menú, animaciones, carta, galería, opiniones, reservas
├── data/
│   ├── carta.json          ← ★ productos de la carta
│   ├── opiniones.json      ← ★ calificaciones y testimonios
│   └── galeria.json        ← ★ lista de fotos de la galería
├── assets/img/
│   ├── logo/               ← logo optimizado (PNG + WebP)
│   ├── hero/               ← fotos de fondo del inicio
│   ├── experiencia/        ← collage de "La experiencia"
│   ├── eventos/            ← tarjetas de despedidas, cumpleaños y grupos
│   ├── carta/              ← fotos de productos (+ placeholders/ para los que faltan)
│   ├── galeria/            ← fotos grandes de la galería (+ thumbs/ miniaturas)
│   ├── sede/               ← foto de la tarjeta de ubicación
│   ├── og/                 ← imagen para compartir en redes (1200×630)
│   └── favicon/            ← íconos del navegador
├── fotos-originales/       ← fotos tal como se subieron (respaldo, no las usa la web)
├── sitemap.xml
├── robots.txt
└── .nojekyll               ← le indica a GitHub Pages que publique los archivos tal cual
```

Todas las rutas son **relativas**, así que el sitio funciona igual en `usuario.github.io/terraza45/` que en un dominio propio.

---

## 2. Publicar en GitHub Pages

1. Asegúrate de que los archivos estén en la rama **main** (si trabajas en otra rama, haz *merge* a main).
2. En GitHub entra al repositorio → **Settings** → **Pages**.
3. En **Build and deployment → Source** elige **Deploy from a branch**.
4. En **Branch** elige **main** y la carpeta **/ (root)** → **Save**.
5. Espera 1–2 minutos. La URL aparecerá arriba en esa misma pantalla (`https://visualgroup-pe.github.io/terraza45/`).

> En cuentas gratuitas, GitHub Pages solo funciona con repositorios **públicos**.

**Dominio propio (opcional):** en *Settings → Pages → Custom domain* escribe tu dominio y luego reemplaza `https://visualgroup-pe.github.io/terraza45/` por el nuevo en `index.html` (canonical, Open Graph, Twitter, JSON-LD), `sitemap.xml` y `robots.txt`.

---

## 3. Ver el sitio en tu computadora

La carta, la galería y las opiniones se cargan desde archivos JSON, y los navegadores bloquean eso si abres `index.html` con doble clic. Usa un servidor local:

```bash
python3 -m http.server 8000
```

y abre http://localhost:8000 (o usa la extensión *Live Server* de VS Code).

---

### Caché del navegador

En `index.html` los archivos CSS y JS se cargan con un número de versión (`css/styles.css?v=20261110-2`). **Cada vez que modifiques algo en `css/` o `js/`, cambia ese número** (en el `<link>` y en los dos `<script>`); así los visitantes no verán una mezcla de la versión vieja y la nueva. Los JSON de `data/` siempre se cargan sin caché.

---

## 4. Cambiar teléfono, WhatsApp, dirección u horario

Edita **`js/config.js`**:

```js
telefono: '952 573 180',
telefonoLink: '+51952573180',
whatsappLink: 'https://wa.link/gfk7by',     // botones "Reserva tu mesa"
whatsappNumero: '51952573180',              // mensajes prellenados (formulario y eventos)
direccion: 'Av. Aviación 4522, Santiago de Surco 15038, Lima – Perú',
horario: {
  texto: 'Jueves a domingo desde las 6:00 p.m.',
  corto: 'Jue a Dom · desde 6:00 p.m.',
  dias: [4, 5, 6, 0],    // 0=dom, 1=lun, 2=mar, 3=mié, 4=jue, 5=vie, 6=sáb
  apertura: '18:00'
}
```

Con eso se actualizan los textos visibles, los enlaces `tel:`, el aviso "Hoy abrimos…" del inicio y la advertencia del formulario si eligen un día cerrado.

Para que **Google** también vea el dato nuevo, cambia lo mismo en `index.html`:
- el bloque `<script type="application/ld+json">` (teléfono, dirección, `openingHoursSpecification`);
- los textos de respaldo con `data-config="..."` (busca `952 573 180` o `6:00 p.m.` con *Buscar y reemplazar*);
- la sección **Experiencia → stats** ("Jue–Dom") y **Ubicación → Precio** si cambian.

> ⚠ **Por confirmar con el cliente:** días de atención y hora de cierre. Cuando se sepa la hora de cierre, agrégala en el JSON-LD como `"closes": "03:00"` junto a `"opens"`.

### Redes sociales

Instagram (`https://www.instagram.com/terraza45_/`), TikTok (`https://www.tiktok.com/@terraza45_`) y Facebook (`https://www.facebook.com/45Terraza/`) aparecen como íconos en el **menú** y en el **footer**. Para cambiar un enlace, busca la URL en `index.html` y reemplázala en todos los lugares (menú, footer y `sameAs` del JSON-LD).

---

## 5. Editar la carta (`data/carta.json`)

Cada categoría tiene un `id`, un `nombre` (el texto de la pestaña) y una lista de `items`:

```json
{
  "nombre": "Margarita Despechada",
  "descripcion": "Tequila, licor de manzana verde, limón y escarchado de sal y azúcar.",
  "precio": 32,
  "foto": "carta/coctel-margarita-verde.webp",
  "etiqueta": "Favorito"
}
```

| Campo | Qué es |
|---|---|
| `nombre` | Nombre del producto |
| `descripcion` | Texto corto (1–2 líneas) |
| `precio` | **Número** en soles, sin "S/" (ej. `32` o `29.90`) |
| `foto` | Ruta de la imagen **dentro de `assets/img/`** |
| `etiqueta` | Opcional: "Favorito", "Para compartir", "Nuevo"… (si no la quieres, borra la línea) |

- **Agregar un producto:** copia un bloque `{ ... }`, pégalo y separa con coma.
- **Nueva categoría:** copia una categoría completa y cambia `id` y `nombre`. Las pestañas se crean solas.
- **`nota`** (arriba del archivo) es el texto pequeño bajo la carta.
- Revisa que el JSON sea válido (comas y comillas) en https://jsonlint.com si algo deja de cargar.

> ⚠ **Los productos y precios actuales son de EJEMPLO** para la demo. Reemplázalos por la carta real del local.

---

## 6. Editar las opiniones (`data/opiniones.json`)

- `resumen.google.calificacion` y `resumen.google.total`: la nota y el n.º de reseñas de Google (hoy 4.6 y 394). Actualízalos de vez en cuando; también en el JSON-LD de `index.html` (`aggregateRating`).
- `resumen.facebook.calificacion`: nota de Facebook (hoy 5).
- `testimonios`: lista con `nombre`, `fuente` (Google/Facebook), `estrellas` (1–5), `texto` y `contexto` (ej. "Cumpleaños").

> ⚠ **Los 3 testimonios actuales son TEXTOS DE EJEMPLO.** Antes de publicar en serio, reemplázalos por reseñas reales copiadas de Google o Facebook (con el nombre tal como aparece).

---

## 7. Fotos: qué va en cada lugar

Formato recomendado: **WebP** (o JPG) comprimido. Puedes convertir y comprimir gratis en https://squoosh.app (calidad 75–82).
Si reemplazas una foto **con el mismo nombre de archivo**, no hay que tocar código.

| Lugar en la web | Carpeta / archivo | Tamaño ideal | Estado |
|---|---|---|---|
| Logo (cabecera y footer) | `assets/img/logo/terraza-45-logo.webp` y `.png` | 900×154 px, fondo transparente | ✅ logo oficial |
| Inicio – fondo y collage (se alternan) | `assets/img/hero/hero-show-escenario.webp`, `hero-maldito-despecho.webp`, `hero-despedida.webp` | **1920×1080** horizontal (o 1080×1350 vertical) | ✅ fotos reales (las actuales miden ~700 px; en PC el fondo se difumina a propósito y las fotos se ven nítidas en el collage. Si consiguen fotos en alta, reemplázalas) |
| Inicio – **video** (opcional) | `assets/video/hero.mp4` | 1920×1080, 10–20 s, sin audio, < 8 MB | ⏳ pendiente: al tenerlo, descomenta el `<video>` en `index.html` |
| La experiencia (collage) | `assets/img/experiencia/show-en-vivo.webp`, `cantante-show.webp`, `letrero-show-bar.webp` | 1000×1100 px aprox. | ✅ |
| Eventos | `assets/img/eventos/despedida-novia.webp`, `cumpleanos-bengala.webp`, `despedida-grupo.webp` | 900×760 px (4:3,4) | ✅ |
| Carta – cócteles y promociones | `assets/img/carta/*.webp` | **800×600** (4:3) o cuadrada 800×800 | ✅ fotos reales |
| Carta – **bebidas, cervezas, piqueos y comida** | `assets/img/carta/placeholders/*.svg` (temporal) | **800×600** | ⏳ **faltan fotos**: colócalas en `assets/img/carta/` (ej. `tequenos.webp`) y cambia el campo `foto` en `carta.json` |
| Galería | `assets/img/galeria/NN-nombre.webp` + miniatura en `assets/img/galeria/thumbs/` | grande: 1400 px lado mayor · miniatura: 560 px | ✅ 22 fotos |
| Ubicación (tarjeta) | `assets/img/sede/sede-show-bar.webp` | 1200×600 px | ✅ (ideal: foto de la **fachada/entrada** del local) |
| Compartir en redes (Open Graph) | `assets/img/og/og-terraza45.jpg` | **1200×630** JPG | ✅ generada con logo + foto del show |
| Favicon | `assets/img/favicon/favicon-32.png`, `apple-touch-icon.png` (180), `icon-512.png` | 32 / 180 / 512 px | ✅ "45°" del logo |

### Agregar o quitar fotos de la galería

Como el sitio es estático, el navegador no puede "leer" una carpeta; por eso la galería usa una lista en **`data/galeria.json`**:

1. Guarda la foto grande en `assets/img/galeria/` y una copia pequeña (560 px) con **el mismo nombre** en `assets/img/galeria/thumbs/`.
2. Agrega una entrada en `data/galeria.json`:
   ```json
   { "archivo": "23-mi-foto.webp", "alt": "Descripción de la foto para Google y accesibilidad", "ancho": 560, "alto": 700 }
   ```
   (`ancho`/`alto` = medidas de la miniatura; evitan saltos al cargar).
3. El orden de la lista es el orden en pantalla.

### Fotos originales

`fotos-originales/` guarda las imágenes tal como se subieron (capturas y descargas). La web usa las versiones optimizadas en `assets/img/` (en total ~2,6 MB frente a 8,7 MB originales). Puedes borrar esa carpeta si no necesitas el respaldo.

---

## 8. Formulario de reservas

Como no hay backend, el formulario **arma un mensaje** con nombre, celular, fecha, hora, n.º de personas, motivo y comentarios, y abre **WhatsApp** (`https://wa.me/51952573180?text=...`) con el texto listo para enviar.
Los botones de cada evento también abren WhatsApp con un mensaje prellenado (atributo `data-wa-msg` en `index.html`).

**Pasar a correo con Formspree** (gratis hasta cierto volumen):
1. Crea un formulario en https://formspree.io y copia el endpoint (`https://formspree.io/f/xxxxxx`).
2. En `index.html`, al `<form id="form-reserva">` agrega `action="https://formspree.io/f/xxxxxx" method="POST"`.
3. En `js/config.js` cambia `reservaModo: 'formspree'`.
El detalle está comentado en `index.html` y en `js/main.js` (función `initReservas`).

---

## 9. SEO y medición

- **Title / description / keywords** orientados a: *bar del despecho en Lima, show bar Lima, bares en Surco, dónde celebrar cumpleaños/despedida en Lima*.
- Un solo **H1** ("El 1.er Bar del Despecho en Lima"), H2 por sección, H3 en tarjetas.
- **Anclas amigables:** `#experiencia`, `#eventos`, `#carta`, `#galeria`, `#opiniones`, `#reservas`, `#ubicacion`.
- **Open Graph + Twitter Card** con imagen 1200×630.
- **JSON-LD `BarOrNightClub`** con nombre, dirección, teléfono, horario, rango de precio, rating y Facebook.
- `sitemap.xml` y `robots.txt` incluidos.

**Google Analytics 4:** en `index.html`, cambia `window.GA4_ID = 'G-XXXXXXXXXX';` por tu ID (GA4 → Administrar → Flujos de datos → Web). Mientras quede `G-XXXXXXXXXX` no se carga nada. Ya se envían eventos de clic en WhatsApp (`click_whatsapp`), reservas enviadas (`reserva_enviada`), cambio de categoría de carta y apertura de fotos.

**Google Search Console:**
1. https://search.google.com/search-console → *Agregar propiedad* → *Prefijo de URL* → pega la URL del sitio.
2. Elige *Etiqueta HTML*, copia el código y pégalo en la línea comentada `google-site-verification` de `index.html` (descoméntala).
3. Sube el cambio, pulsa *Verificar* y en *Sitemaps* envía `sitemap.xml`.

**Bonus local:** mantener actualizado el perfil de **Google Business Profile** (fotos, horario, enlace a esta web) es lo que más ayuda para "bares en Surco".

---

## 10. Pendientes por confirmar con el cliente

- [ ] Días y horario exactos (¿jueves a domingo?) y **hora de cierre**.
- [ ] Carta real: productos, descripciones y precios (hoy son de ejemplo).
- [ ] Testimonios reales (hoy son de ejemplo).
- [ ] Beneficios/promociones de despedidas y cumpleaños (textos de ejemplo en la sección Eventos de `index.html`).
- [ ] Fotos de bebidas, cervezas, piqueos y comida; foto de fachada; fotos o video del show en alta resolución para el inicio.
- [ ] ID de Google Analytics 4 y verificación de Search Console.
- [ ] Dominio definitivo (si no será `visualgroup-pe.github.io/terraza45`).
