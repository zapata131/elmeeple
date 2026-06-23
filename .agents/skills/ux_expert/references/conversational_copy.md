# Conversational Copywriting Standards Playbook

This document defines the copywriting standards and conversational guidelines required to align **El Meeple** with the Google Developer Documentation Style Guide. All UI copy, labels, placeholders, errors, and success notifications must follow these rules.

---

## 1. Core Voice and Tone Guidelines

We communicate with our users in a **warm, professional, direct, and helpful** voice.

### 1.1 Active Voice and Second Person
*   Address the user in the second person ("you" / "tú/tus/usted") to establish a direct, conversational connection.
*   Use active voice instead of passive voice to make actions clear and immediate.
    *   **Before (Passive)**: *"Los locales filtrados pueden ser seleccionados en la barra lateral."*
    *   **After (Active)**: *"Selecciona un local de la barra lateral para ver sus detalles en el mapa."*
    *   **Before (Mechanical)**: *"Debes iniciar sesión para guardar favoritos."*
    *   **After (Active/Helpful)**: *"Inicia sesión para guardar tus locales favoritos."*

### 1.2 Humanized Technical Language
*   Translate backend processes and database operations into clear, human benefits. Avoid exposing system metrics or mechanical jargon (like dimensions, compression qualities, or database tables).
    *   **Before**: *"Logo recortado a 150x150px y comprimido a JPEG Base64."*
    *   **After**: *"¡Tu logo se ve genial! Lo hemos ajustado automáticamente para que luzca perfecto en tu perfil."*
    *   **Before**: *"Cargando datos de geocodificación de Nominatim..."*
    *   **After**: *"Buscando dirección en el mapa"*

---

## 2. Casing Standards: Sentence Case

To maintain a clean, contemporary design aesthetic, all user-facing copy must use **sentence case**. Capitalize only the first word and proper nouns (e.g. brand names like BGG, BoardGameGeek, Instagram, Discord, El Meeple, CDMX).

### Examples of Correct Sentence Case
*   **Page Headings**: `# Configuración de tu cuenta`, `## Ludoteca de juegos`, `## Comentarios de la comunidad`
*   **Form Labels**: `Nombre del local`, `Tipo de local`, `Identificación fiscal (RFC o Tax ID)`
*   **Select Options**: `Café de juegos`, `Tienda de juegos y TCG`, `Híbrido (café y tienda)`
*   **Button Actions**: `Guardar en favoritos`, `Publicar reseña`, `Sincronizar ludoteca`
*   **Placeholders**: `Buscar juego por título (ej. Scythe, Catan)...`, `Escribe una dirección...`

---

## 3. Human-Centric Error Casing and Alerts

Errors should be helpful, explanatory, and written in a calm, reassuring tone. Under no circumstances should error messages use all-caps, exclamation marks, or developer-only jargon.

*   **Rule 1: No Exclamation Marks in Errors**: Exclamation marks can feel accusatory or alarmist. Keep error messages calm.
    *   **Before**: *"¡ERROR: COMPROBANTE DEMASIADO GRANDE!"*
    *   **After**: *"El archivo es demasiado pesado. Por favor, sube una imagen menor a 5 MB."*
*   **Rule 2: Offer a Clear Exit/Solution**: Don't just state that something failed; explain how the user can resolve it.
    *   **Before**: *"Error de sincronización de colección."*
    *   **After**: *"No pudimos conectar con tu cuenta de BoardGameGeek. Por favor, verifica que tu nombre de usuario sea correcto e inténtalo de nuevo."*
*   **Rule 3: Avoid Decorative Ellipses**: Do not add ellipses (`...`) to static text or buttons unless representing actual content truncation.
    *   **Before**: *"Cargando locales..."*, *"Publicando..."*
    *   **After**: *"Cargando locales"*, *"Publicando"*
