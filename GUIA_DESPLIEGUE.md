# Guía de Despliegue Automático (CI/CD) con GitHub Actions

Esta guía detalla los pasos para automatizar la actualización de tu servidor local cada vez que subes cambios al repositorio ("Push").

## 🛠️ Prerrequisitos
1.  Tener el proyecto subido a un repositorio en **GitHub**.
2.  Tener acceso a la terminal del **Servidor Local** (la máquina donde correrá el proyecto).
3.  Tener **Docker** y **Docker Compose** instalados y funcionando en el servidor.

---

## Paso 1: Configuración del Repositorio
*(Este paso ya está realizado en el código, pero es bueno verificarlo)*

Asegúrate de que existe el archivo `.github/workflows/deploy.yml` en tu proyecto. Este archivo contiene las instrucciones que le dicen a GitHub qué hacer.

---

## Paso 2: Conectar tu Servidor (Runner)

Necesitamos instalar un pequeño agente en tu servidor que escuche a GitHub.

1.  Ve a tu repositorio en **GitHub.com**.
2.  Haz clic en la pestaña **Settings** (Configuración) -> menú lateral **Actions** -> **Runners**.
3.  Haz clic en el botón verde **"New self-hosted runner"**.
4.  Selecciona la imagen **Linux**.
5.  **En tu Servidor Local**: Abre una terminal y pega los comandos que te muestra GitHub uno por uno.
    *   *Nota*: Crearán una carpeta `actions-runner` y descargarán el agente.
    *   Cuando el instalador (`config.sh`) te pida configurar cosas, puedes presionar `Enter` para aceptar los valores por defecto.

### ⚠️ Importante: Ejecutar como Servicio
Por defecto el runner solo corre si tienes la terminal abierta. Para que funcione siempre (incluso si reinicias), ejecuta estos comandos dentro de la carpeta `actions-runner`:

```bash
# Instalar el servicio en el sistema
sudo ./svc.sh install

# Iniciar el servicio
sudo ./svc.sh start
```

Si dice `active (running)`, ¡ya está listo!

---

## Paso 3: Configurar Secretos (Variables de Entorno)

Por seguridad, no subimos contraseñas al código. Debemos dárselas a GitHub de forma segura.

1.  En tu repositorio de GitHub, ve a **Settings** -> menú lateral **Secrets and variables** -> **Actions**.
2.  Haz clic en **"New repository secret"**.
3.  Agrega las siguientes variables (con los valores que tú decidas para producción):

| Nombre del Secreto | Valor Ejemplo | Descripción |
| :--- | :--- | :--- |
| `MYSQL_ROOT_PASSWORD` | `supersecreto123` | Contraseña root de DB |
| `MYSQL_PASSWORD` | `verdu_password` | Contraseña del usuario verdu |
| `MYSQL_USER` | `verdu_user` | Usuario de la DB |
| `MYSQL_DATABASE` | `balanza_verdu_db` | Nombre de la DB |
| `DJANGO_SECRET_KEY` | `django-insecure...` | Tu llave secreta de Django |
| `DEBUG` | `False` | Falso para producción |
| `ALLOWED_HOSTS` | `*` | O tu IP específica |

---

## Paso 4: ¡Probar!

1.  Haz un cambio pequeño en tu código local (ej. cambiar un texto en el README).
2.  Sube los cambios:
    ```bash
    git add .
    git commit -m "Probando despliegue automático"
    git push origin main
    ```
3.  Ve a la pestaña **Actions** en GitHub. Verás un nuevo flujo ejecutándose.
4.  Si entras, verás cómo tu servidor local empieza a trabajar, descarga el código y reinicia los dockers automágicamente. 🚀
