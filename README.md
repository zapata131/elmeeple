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

*   🗺️ **Interfaz Centrada en el Mapa**: Un mapa interactivo y responsivo como página de inicio que se centra automáticamente en tu ciudad para mostrarte los locales más cercanos.
*   ⚡ **Tarjetas de Vista Rápida**: Haz clic en cualquier pin del mapa para ver una tarjeta informativa con el nombre del local, horario, especialidades y un enlace directo a su perfil completo.
*   🔑 **Portal de Tiendas Auto-gestionado**: Flujo de registro sencillo para que los dueños de tiendas y organizadores de eventos den de alta su local, configuren sus horarios y ubiquen su pin en el mapa.
*   🏷️ **Inventario por Etiquetas**: En lugar de capturar bases de datos complejas, las tiendas definen su *ludoteca* usando etiquetas preestablecidas (ej. *Eurogames*, *TCGs*, *Wargames*, *Rol*, *D&D*, *Magic: The Gathering*).
*   🛡️ **Verificación de Administrador**: Filtro de seguridad que permite a los administradores de la plataforma aprobar los locales registrados antes de que aparezcan públicamente en el mapa.

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
