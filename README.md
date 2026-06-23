# El meeple

### ¿Dónde jugamos hoy? Tu guía de cafés de juegos y tiendas de TCG

---

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)

**El Meeple** es el directorio interactivo y mapa definitivo para cafés de juegos de mesa, tiendas de cartas coleccionables (TCG) y comunidades de juego libre en Latinoamérica y España. 

Nuestra misión es conectar a los jugadores con sus espacios de juego locales, impulsar el tráfico a las tiendas físicas y brindarte una respuesta rápida y hermosa a la eterna pregunta: *¿dónde jugamos hoy?*

Desarrollamos este proyecto en colaboración con [La Matatena](https://la-matatena.com) y lo puedes encontrar en [elmeeple.com](https://elmeeple.com).

---

## Características principales (MVP)

*   **Interfaz de mapa en pantalla completa**: Puedes usar un mapa interactivo y responsivo como página de inicio que se centra en tu ciudad para mostrarte los locales más cercanos, decorado con pines de marca personalizados.
*   **Panel lateral de búsqueda (sidebar)**: Tienes a tu disposición un sidebar fijo en escritorio que contiene el buscador, filtros por etiquetas de juego y una lista navegable de locales. En dispositivos móviles, esta sección se convierte en una cabecera de búsqueda superior compacta para maximizar tu visibilidad del mapa.
*   **Tarjetas de vista rápida**: Puedes hacer clic en cualquier pin del mapa o local de la lista para abrir una tarjeta flotante de vista rápida con el logotipo, la descripción, el horario interactivo y las redes sociales del local.
*   **Portal de tiendas autogestionado**: Cuentas con un flujo de registro secuencial de cinco pasos para que los propietarios den de alta su local, seleccionen su ubicación interactiva en el mapa, configuren sus horarios de apertura y suban su logotipo.
*   **Autorrecorte de logotipo en el cliente**: El flujo de registro procesa la imagen que subes utilizando un lienzo HTML5 Canvas invisible en el navegador, recortándola y comprimiéndola en un cuadrado perfecto de 150x150px en Base64 de alta eficiencia (5-10 KB). Esto evita el almacenamiento pesado en la base de datos.
*   **Inventario por etiquetas**: Las tiendas definen su ludoteca usando etiquetas preestablecidas (como Eurogames, TCGs, Wargames, Rol, D&D, Magic: The Gathering) en lugar de capturar bases de datos complejas.
*   **Verificación de administrador**: Un filtro de seguridad en la base de datos permite a los administradores de la plataforma verificar los locales registrados antes de que aparezcan públicamente en el mapa general.

---

## Stack tecnológico

Elegimos un stack moderno y eficiente para garantizar velocidad, escalabilidad and un desarrollo ágil:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router). Actúa como un monolito para la interfaz de usuario (Frontend) y las Server Actions/API Routes (Backend).
*   **Base de datos y autenticación:** [Supabase](https://supabase.com/) (PostgreSQL). Gestiona los datos relacionales para conectar tiendas, etiquetas y usuarios, junto con la autenticación integrada.
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) o [Shadcn UI](https://ui.shadcn.com/). Nos ayuda a lograr un diseño limpio, moderno, responsivo y con una estética premium.
*   **Correos transaccionales:** [Resend](https://resend.com/). Envía notificaciones de registro y verificación de cuentas.
*   **Hosting:** [Vercel](https://vercel.com/). Proporciona despliegues continuos (CI/CD) ultrarrápidos integrados con GitHub.

---

## Configuración para desarrollo local

### Prerrequisitos

Para ejecutar este proyecto, necesitas tener instalado:
*   [Node.js](https://nodejs.org/) (versión 18 o superior)
*   [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
*   Una cuenta de [Supabase](https://supabase.com/) (para desarrollo local o en la nube)

### Pasos de instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/zapata131/elmeeple.git
    cd elmeeple
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase y NextAuth:
    ```env
    # Supabase (Database & Auth)
    NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

    # NextAuth (Configuración de sesión)
    NEXTAUTH_SECRET=un_secreto_seguro_para_sesiones
    NEXTAUTH_URL=http://localhost:3000
    ```

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el proyecto en ejecución.

---

## Estrategia de pruebas y control de calidad visual

Para mantener la máxima estabilidad y consistencia visual en todas las pantallas de El Meeple, contamos con una suite de pruebas dividida en dos niveles:

### 1. Pruebas unitarias y de integración (Jest y React Testing Library)

Valida la lógica de renderizado de tus componentes y los flujos de datos de forma aislada. Para evitar problemas de entorno en JSDOM, simulamos las capas de Leaflet y los imports dinámicos de forma síncrona y limpia.
*   **Ejecuta las pruebas unitarias:**
    ```bash
    npm run test
    ```
*   **Activa el modo de observación (Watch Mode):**
    ```bash
    npm run test:watch
    ```

### 2. Control de calidad visual y pruebas de navegador en vivo (Chrome DevTools MCP)

Para verificar la experiencia de usuario de extremo a extremo en un navegador real, puedes usar Chrome DevTools MCP. Este flujo simula la navegación de un usuario real en resoluciones de escritorio (1280x800) y móvil (390x844). Te permite auditar la interactividad del mapa, la apertura de tarjetas rápidas, el flujo de registro y capturar pantallas de forma dinámica. De esta manera, te aseguras de que no existan elementos superpuestos, textos rotos o controles inaccesibles, y confirmas la ausencia de errores en la consola del navegador.
*   **Flujo de trabajo:** Interactúas directamente con el navegador en vivo usando herramientas de Chrome DevTools (navegar, hacer clic, rellenar formularios, capturar pantalla) durante el proceso de revisión de pull requests.

### 3. Script de verificación antes de confirmar y subir

Antes de subir cualquier cambio a tu rama o abrir un Pull Request, ejecuta la verificación completa. Con esto compruebas que no hay errores de linter, que el proyecto compila a producción sin problemas y que todas las pruebas de Jest pasan:
```bash
npm run verify
```

---

## Contribuciones

¡Nos encanta recibir tus contribuciones! Si quieres ayudar a mejorar El Meeple, sigue estos pasos:

1.  **Revisa el diseño del proyecto:** Lee nuestro documento de arquitectura [DESIGN.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/DESIGN.md) para entender el flujo de trabajo y la estructura de datos.
2.  **Sigue la estrategia de ramificación (GitHub Flow):**
    *   Crea una rama para tu feature o corrección: `git checkout -b feature/nombre-de-tu-feature` o `git checkout -b fix/nombre-de-tu-fix`.
    *   Escribe pruebas unitarias o de integración para validar tus cambios.
    *   Haz commits claros y descriptivos.
3.  **Envía un Pull Request:** Abre un PR apuntando a la rama `main` explicando detalladamente los cambios que realizaste y adjuntando las pruebas correspondientes.

---

## Licencia

Este proyecto está bajo la licencia **GNU General Public License v3.0 (GPL-3.0)**. Consulta el archivo [LICENSE](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/LICENSE) (próximamente disponible) para obtener más detalles.

---

Desarrollamos este proyecto con amor para la comunidad de juegos de mesa. 
Si tienes preguntas o ideas, puedes encontrarnos en [la-matatena.com](https://la-matatena.com) y [elmeeple.com](https://elmeeple.com).
