# Backlog de Historias de Usuario & Validación de Requerimientos

Este documento detalla la planeación del producto para **El Meeple**, categorizando las historias de usuario de acuerdo con los tres roles principales del sistema: **Jugadores**, **Socios/Propietarios**, y **Administradores de la Plataforma**. 

Cada historia de usuario incluye sus criterios de aceptación específicos y su estado de validación actual en el proyecto.

---

## 1. Definición de Personas (Target Users)

*   **Jugador (Player):** Entusiasta de los juegos de mesa modernos (eurogames, party games) o coleccionista/competidor de TCGs (Magic: The Gathering, Pokémon, Yu-Gi-Oh!) que busca establecimientos óptimos para jugar, comprar accesorios o participar en torneos.
*   **Socio/Propietario (Partner):** Dueño o encargado de un café de juegos o tienda de TCG física que busca aumentar su visibilidad, promocionar su inventario, publicar eventos competitivos y gestionar su comunidad.
*   **Administrador de la Plataforma (Platform Admin):** Moderador y gestor general de El Meeple, encargado de validar la autenticidad de los establecimientos y asegurar la calidad del directorio.

---

## 2. Historias de Usuario: Jugador (Descubrimiento y Comunidad)

### US-01: Mapa Interactivo de Locales
*   **Fórmula:** Como **Jugador**, quiero **ver un mapa en pantalla completa con pines personalizados**, para **localizar visual y rápidamente los cafés de juegos a mi alrededor**.
*   **Criterios de Aceptación:**
    1. El mapa debe cargarse centrado en la ubicación predeterminada (CDMX) o la ubicación del usuario si otorga permisos.
    2. Los pines deben usar un marcador SVG personalizado con el color de marca (Malva suave `#8367C7`).
    3. Hacer clic en un pin debe abrir la tarjeta flotante de vista rápida (Quick View Card).
*   **Estado:** **[COMPLETADO]** (Implementado en el flujo principal del mapa).

### US-02: Filtro de Radio Geográfico
*   **Fórmula:** Como **Jugador**, quiero **filtrar los locales por distancia (2 km, 5 km, 10 km, 20 km)**, para **encontrar establecimientos accesibles sin tener que viajar distancias excesivas**.
*   **Criterios de Aceptación:**
    1. Debe mostrar chips de selección debajo de la barra de búsqueda principal.
    2. Si se otorga permiso de geolocalización, se calcula la distancia desde la ubicación del usuario usando la fórmula de Haversine.
    3. Si el usuario busca una dirección en el mapa, el punto de referencia cambia al centro de la búsqueda.
*   **Estado:** **[COMPLETADO]** (Verificado en tests unitarios y de integración).

### US-03: Búsqueda de Juegos en Ludotecas
*   **Fórmula:** Como **Jugador**, quiero **buscar un título de juego específico en la barra de búsqueda del mapa**, para **saber qué locales lo tienen disponible en su colección de juego libre**.
*   **Criterios de Aceptación:**
    1. La barra de búsqueda debe permitir alternar entre buscar "Locales" y "Juegos".
    2. Si se busca un juego, el sidebar de locales debe mostrar insignias indicando que el juego está disponible (ej: *"Tiene Scythe"*).
    3. Si no hay locales con ese juego, debe mostrarse una tarjeta de estado vacío (Zero State) responsiva con sugerencias de otros títulos.
*   **Estado:** **[COMPLETADO]** (Implementado mediante búsqueda de arrays de texto en PostgreSQL).

### US-04: Perfil de Establecimiento y Vista de Catálogo
*   **Fórmula:** Como **Jugador**, quiero **ver el perfil dedicado de un local y explorar su colección en vista de cuadrícula o lista**, para **conocer el ambiente y los juegos antes de visitarlo**.
*   **Criterios de Aceptación:**
    1. El perfil debe cargar la descripción del local, horario formateado en español y enlaces a redes sociales (Instagram, Discord).
    2. Debe permitir buscar juegos localmente dentro de la ludoteca del local.
    3. Debe permitir alternar entre vista de cuadrícula (Grid) y vista de lista (List) compacta de alta densidad.
*   **Estado:** **[COMPLETADO]** (Implementado en `/venue/[slug]`).

### US-05: Sistema de Reseñas y Vibe Tags
*   **Fórmula:** Como **Jugador**, quiero **calificar un local y seleccionar etiquetas de ambiente (Vibe Tags)**, para **dar feedback sobre el lugar y ayudar a otros a encontrar el ambiente ideal**.
*   **Criterios de Aceptación:**
    1. Permite calificar del 1 al 5 usando estrellas interactivas.
    2. Permite seleccionar múltiples vibe tags preestablecidos (ej: *Eurogames*, *Café*, *TCGs*, *Familiar*).
    3. La reseña se publica en tiempo real en la pestaña de Comunidad del local.
*   **Estado:** **[COMPLETADO]** (Conectado a la base de datos relacional).

---

## 3. Historias de Usuario: Socio/Propietario (Autogestión y Promoción)

### US-06: Onboarding Funnel Guiado
*   **Fórmula:** Como **Propietario**, quiero **registrar mi local en un formulario secuencial de 5 pasos**, para **darlo de alta sin confusión ni fricción**.
*   **Criterios de Aceptación:**
    1. Paso 1 debe autocompletar el nombre y correo del propietario usando la sesión activa de NextAuth.
    2. Debe incluir un selector interactivo del mapa para fijar las coordenadas exactas (`lat`, `lng`).
    3. El paso de carga de logotipo debe recortar la imagen automáticamente en un cuadrado de `150x150px` a través de un canvas y comprimirla en Base64.
*   **Estado:** **[COMPLETADO]** (Flujo de onboarding optimizado y verificado).

### US-07: Sincronización Automática con BoardGameGeek (BGG)
*   **Fórmula:** Como **Propietario**, quiero **sincronizar la colección de juegos de mi local con mi usuario de BGG**, para **evitar capturar la información juego por juego**.
*   **Criterios de Aceptación:**
    1. Permite ingresar el nombre de usuario de BGG desde el panel de control del propietario.
    2. Llama al API XML2 de BGG de manera segura en el servidor.
    3. Si BGG responde con código `202` (solicitud en cola), la interfaz inicia un contador progresivo y reintenta automáticamente hasta completar el guardado.
*   **Estado:** **[COMPLETADO]** (Optimizado con un trabajo de sincronización en segundo plano por CRON).

### US-08: Publicación de Anuncios en Pizarra (Bulletin Board)
*   **Fórmula:** Como **Propietario**, quiero **publicar anuncios cortos o avisos de restock en la pizarra de novedades de mi local**, para **comunicar noticias rápidas a los jugadores**.
*   **Criterios de Aceptación:**
    1. El formulario en el panel de control debe requerir título y contenido.
    2. Los anuncios se muestran de inmediato en la tarjeta de vista rápida (Quick View) cuando los usuarios hacen clic en el local en el mapa.
*   **Estado:** **[COMPLETADO]** (Integrado en el mapa general).

### US-09: Gestión de Torneos y Eventos (Milestone 5)
*   **Fórmula:** Como **Propietario**, quiero **publicar, listar y eliminar eventos competitivos o recreativos desde mi panel**, para **atraer a jugadores competitivos a mi local**.
*   **Criterios de Aceptación:**
    1. Debe permitir ingresar título del evento, juego/categoría, fecha/hora, costo de inscripción y cupo máximo de participantes.
    2. Debe listar los eventos activos y permitir eliminarlos con un botón de borrado rápido.
    3. Los eventos creados deben mostrarse en el perfil del local bajo la pestaña "Eventos" (activa por defecto en escritorio).
*   **Estado:** **[COMPLETADO / VERIFICADO]** (Implementado en esta iteración y 100% verificado en E2E y unit tests).

---

## 4. Historias de Usuario: Administrador de la Plataforma (Page Admin)

### US-10: Panel de Auditoría de Solicitudes
*   **Fórmula:** Como **Administrador de la Plataforma**, quiero **ver un panel de control con las solicitudes de registro pendientes**, para **verificar la información y los documentos de soporte de los locales**.
*   **Criterios de Aceptación:**
    1. El panel debe ser accesible únicamente para usuarios con rol `admin` o `partner` (para pruebas controladas) en la ruta `/admin`.
    2. Debe mostrar contadores estadísticos de solicitudes: Total, Pendientes, Aprobadas y Rechazadas.
    3. Debe listar las solicitudes en una tabla clara con el nombre del local, propietario, correo y estado.
*   **Estado:** **[COMPLETADO]** (Implementado en `src/app/admin`).

### US-11: Aprobación y Rechazo Seguro con Rationale
*   **Fórmula:** Como **Administrador de la Plataforma**, quiero **aprobar o rechazar una solicitud (indicando el motivo en caso de rechazo)**, para **mantener la base de datos libre de registros falsos o inválidos**.
*   **Criterios de Aceptación:**
    1. Al hacer clic en "Ver Detalles", se abre un modal con el RFC/Tax ID y el enlace al comprobante de operaciones (permiso de funcionamiento).
    2. Si se aprueba, se marca el local como verificado (`verified: true`) y se actualiza el estado de verificación a `'approved'`, mostrándolo públicamente en el mapa.
    3. Si se rechaza, se requiere ingresar un motivo de rechazo (`rejection_reason`), se actualiza el estado a `'rejected'` y el local permanece oculto en el mapa. El propietario verá el motivo de rechazo en su panel.
*   **Estado:** **[COMPLETADO]** (Implementado en la vista de administración y servidor).

### US-12: Canal de Comunicación Directo
*   **Fórmula:** Como **Administrador de la Plataforma**, quiero **contactar directamente al propietario por correo electrónico desde el panel de detalles del modal**, para **solicitar aclaraciones sobre su documentación de manera inmediata**.
*   **Criterios de Aceptación:**
    1. El modal de detalles debe renderizar botones de acción rápida si el propietario ingresó correo o teléfono de contacto.
    2. El botón de correo debe abrir el cliente local usando `mailto:`.
    3. No debe mostrar emojis, alineándose con el estilo visual premium de la plataforma.
*   **Estado:** **[COMPLETADO]** (Integrado en el modal de verificación de `/admin`).

---

## 5. Historias de Usuario del Backlog Activo (Milestone 5 - En Desarrollo)

### US-13: Filtrado Avanzado de TCGs y Sellos Oficiales (Issue #64)
*   **Fórmula:** Como **Jugador**, quiero **filtrar locales en el mapa por TCGs específicos y ver si son tiendas oficiales (WPN/OTS)**, para **encontrar tiendas que organicen torneos sancionados de mis juegos de cartas favoritos**.
*   **Criterios de Aceptación:**
    1. El sidebar del mapa debe incluir filtros para TCGs populares (*Magic: The Gathering*, *Pokémon*, *Yu-Gi-Oh!*, *Lorcana*).
    2. Los locales verificados como tiendas de juego organizado oficial deben mostrar un sello o badge distintivo ("Torneos Oficiales") en su perfil y tarjetas.
*   **Estado:** **[EN PROGRESO]** (Próxima tarea a desarrollar).

### US-14: Tema Oscuro Premium (Issue #65)
*   **Fórmula:** Como **Usuario (Jugador o Propietario)**, quiero **activar el modo oscuro en toda la plataforma**, para **navegar cómodamente de noche y reducir la fatiga visual**.
*   **Criterios de Aceptación:**
    1. Debe incluir un botón de alternancia (Sun/Moon SVG) en el encabezado global.
    2. Todos los componentes, mapa, barras de búsqueda y modales deben adaptarse a una paleta oscura sofisticada basada en tonos carbón y acentos malva suave.
*   **Estado:** **[EN PROGRESO]** (Por implementar).
