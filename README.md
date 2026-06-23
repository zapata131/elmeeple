# **El Meeple 🎲**

### **¿Dónde jugamos hoy? Tu guía de cafés de juegos y tiendas TCG**

---

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)

**El Meeple** es el directorio interactivo y mapa definitivo para cafés de juegos de mesa, tiendas de cartas coleccionables (TCG) y comunidades de juego libre en **Latinoamérica y España**. 

Nuestra misión es conectar a los jugadores con sus espacios de juego locales, impulsando el tráfico a las tiendas físicas y brindando a la comunidad una respuesta rápida y hermosa a la eterna pregunta: *¿dónde jugamos hoy?*

Desarrollado en colaboración con [La Matatena](https://la-matatena.com) y disponible en [elmeeple.com](https://elmeeple.com).

---

## **🚀 Características Principales (MVP)**

*   🗺️ **Interfaz de Mapa en Pantalla Completa**: Un mapa interactivo y responsivo como página de inicio que se centra en tu ciudad para mostrarte los locales más cercanos, decorado con pines de marca personalizados.
*   🗂️ **Panel Lateral de Búsqueda (Sidebar)**: Un sidebar fijo en escritorio que contiene el buscador, filtros por etiquetas de juego y una lista scrollable de locales. En móvil se convierte en una cabecera de búsqueda superior compacta para maximizar la visibilidad del mapa.
*   ⚡ **Tarjetas de Vista Rápida**: Haz clic en cualquier pin del mapa o local de la lista para abrir una tarjeta flotante de vista rápida con el logotipo, descripción, horario interactivo y redes sociales del local.
*   🔑 **Portal de Tiendas Auto-gestionado**: Flujo de registro secuencial (5 pasos) para que los propietarios den de alta su local, seleccionen su ubicación interactiva en el mapa, configuren sus horarios de apertura y suban su logotipo.
*   🎨 **Autorrecorte de Logotipo en Cliente**: El flujo de registro procesa la imagen cargada por el dueño utilizando un lienzo HTML5 Canvas invisible en el cliente, recortándola y comprimiéndola en un cuadrado perfecto de `150x150px` en Base64 de alta eficiencia (5-10 KB) para evitar almacenamiento pesado.
*   🏷️ **Inventario por Etiquetas**: En lugar de capturar bases de datos complejas, las tiendas definen su *ludoteca* usando etiquetas preestablecidas (ej. *Eurogames*, *TCGs*, *Wargames*, *Rol*, *D&D*, *Magic: The Gathering*).
*   🛡️ **Verificación de Administrador**: Filtro de seguridad en base de datos que permite a los administradores de la plataforma verificar los locales registrados antes de que aparezcan públicamente en el mapa general.

---

## **🛠️ Stack Tecnológico**

Elegimos un stack moderno y eficiente para garantizar velocidad, escalabilidad y un desarrollo ágil:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router) - Monolito para la interfaz de usuario (Frontend) y Server Actions/API Routes (Backend).
*   **Base de Datos y Auth:** [Supabase](https://supabase.com/) (PostgreSQL) - Gestión de datos relacionales robusta para conectar tiendas, etiquetas y usuarios, junto con autenticación integrada.
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) o [Shadcn UI](https://ui.shadcn.com/) para un diseño limpio, moderno, responsivo y con una estética premium.
*   **Correos Transaccionales:** [Resend](https://resend.com/) - Para notificaciones de onboarding y verificación de cuentas.
*   **Hosting:** [Vercel](https://vercel.com/) - Despliegues continuos (CI/CD) ultrarrápidos integrados con GitHub.

---

## **💻 Configuración para Desarrollo Local**

### **Prerrequisitos**
Asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/) (versión 18 o superior)
*   [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
*   Una cuenta de [Supabase](https://supabase.com/) (para desarrollo local o en la nube)

### **Pasos de Instalación**

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

## **🧪 Estrategia de Pruebas y QA Visual**

Para mantener la máxima estabilidad y consistencia visual en todas las pantallas de **El Meeple**, contamos con una suite de pruebas dividida en dos niveles:

### **1. Pruebas Unitarias y de Integración (Jest + React Testing Library)**
Valida la lógica de renderizado de componentes y flujos de datos de forma aislada. Para evitar problemas de entorno en JSDOM, simulamos las capas de Leaflet y los imports dinámicos de forma síncrona y limpia.
*   **Ejecutar pruebas unitarias:**
    ```bash
    npm run test
    ```
*   **Modo observación (Watch Mode):**
    ```bash
    npm run test:watch
    ```

### **2. QA Visual y Pruebas de Navegador en Vivo (Chrome DevTools MCP)**
Para verificar la experiencia de usuario de extremo a extremo en un navegador real, se utiliza Chrome DevTools MCP. Este flujo simula la navegación de un usuario real en resoluciones de **Escritorio (Desktop 1280x800)** y **Móvil (iPhone viewport 390x844)**, permitiendo auditar la interactividad del mapa, la apertura de tarjetas rápidas, el flujo de registro y capturar capturas de pantalla de forma dinámica para asegurar que no existan elementos superpuestos, textos rotos o controles inaccesibles, así como la ausencia de errores en la consola del navegador.
*   **Flujo de Trabajo:** La IA interactúa directamente con el navegador en vivo usando herramientas de Chrome DevTools (navegar, hacer clic, rellenar formularios, capturar pantalla) durante el proceso de revisión de pull requests.

### **3. Script de Verificación Pre-Commit/Pre-Push**
Antes de subir cualquier cambio a tu rama o abrir un Pull Request, ejecuta la verificación completa para comprobar que no hay errores de linter, que el proyecto compila a producción sin problemas y que todas las pruebas de Jest pasan:
```bash
npm run verify
```

---

## **🤝 Contribuciones**

¡Nos encanta recibir contribuciones de la comunidad! Si quieres ayudar a mejorar **El Meeple**, sigue estos pasos:

1.  **Revisa el diseño del proyecto:** Lee nuestro documento de arquitectura [DESIGN.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/DESIGN.md) para entender el flujo de trabajo y la estructura de datos.
2.  **Sigue la estrategia de ramificación (GitHub Flow):**
    *   Crea una rama para tu feature o corrección: `git checkout -b feature/nombre-de-tu-feature` o `git checkout -b fix/nombre-de-tu-fix`.
    *   Escribe pruebas unitarias o de integración para validar tus cambios.
    *   Haz commits claros y descriptivos.
3.  **Envía un Pull Request:** Abre un PR apuntando a la rama `main` explicando detalladamente los cambios realizados y adjuntando las pruebas correspondientes.

---

## **📄 Licencia**

Este proyecto está bajo la licencia **GNU General Public License v3.0 (GPL-3.0)**. Consulta el archivo [LICENSE](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/LICENSE) (próximamente disponible) para más detalles.

---

Desarrollado con ❤️ por la comunidad de juegos de mesa. 
Si tienes preguntas o ideas, puedes encontrarnos en [la-matatena.com](https://la-matatena.com) and [elmeeple.com](https://elmeeple.com).
