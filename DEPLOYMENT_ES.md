# Cómo desplegar "Multiplica Pokémons" en tu Raspberry Pi

Tienes varias formas de llevar la aplicación a tu Raspberry Pi. Elige la que te resulte más cómoda.

## Opción A: Transferencia por Red (Recomendada si tienes SSH)

Si tienes acceso por terminal a tu Raspberry Pi, puedes enviar los archivos directamente usando el comando `scp`.

1.  Abre tu terminal en Mac.
2.  Navega a la carpeta del proyecto:
    ```bash
    cd /Users/jordinadal/Documents/projects/Bel-multiplicaPokemons
    ```
3.  Envía los archivos (sustituye `usuario` e `IP` por los de tu Pi):
    ```bash
    scp -r . pi@192.168.1.XX:/home/pi/bel-multiplica
    ```

## Opción B: Usando un USB

1.  Copia la carpeta entera `Bel-multiplicaPokemons` a un pendrive USB.
2.  Conecta el USB a tu Raspberry Pi.
3.  Copia la carpeta al Escritorio o a `/home/pi`.

## Opción C: Usando Git (Si tienes GitHub)

1.  Sube tu proyecto a un repositorio de GitHub.
2.  En la Raspberry Pi, clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/bel-multiplica.git
    ```

---

# Cómo ejecutar la aplicación en la Raspberry Pi

Una vez tengas los archivos en la Pi, necesitas un servidor web ligero para que funcione correctamente (especialmente para guardar el progreso).

## Método Fácil: Servidor Python (Ya instalado)

La Raspberry Pi viene con Python. Solo tienes que ejecutarlo.

1.  Abre la terminal en la Pi.
2.  Entra en la carpeta:
    ```bash
    cd /home/pi/bel-multiplica
    ```
3.  Inicia el servidor:
    ```bash
    python3 -m http.server 8000
    ```
4.  ¡Listo!
    - **Desde la propia Pi**: Abre el navegador y ve a `http://localhost:8000`.
    - **Desde una Tablet/Móvil**: Averigua la IP de la Pi (`hostname -I`) y ve a `http://<IP-DE-LA-PI>:8000`.

## Método "Pro": Arranque automático (Quiosco)

Si quieres que la Pi arranque directo en el juego (ideal para una "consola" dedicada):

1.  Crea un archivo de autostart:
    ```bash
    mkdir -p /home/pi/.config/autostart
    nano /home/pi/.config/autostart/juego.desktop
    ```
2.  Pega esto dentro:
    ```ini
    [Desktop Entry]
    Type=Application
    Name=MultiplicaPokemons
    Exec=chromium-browser --kiosk http://localhost:8000
    StartupNotify=false
    ```
    *(Nota: Esto requiere que el servidor Python arranque antes, o puedes abrir simplemente el archivo HTML si no te importa la persistencia estricta en algunos navegadores, aunque se recomienda servidor).*

---

# Requisitos

- **Internet**: La Pi necesita conexión a internet para descargar las imágenes de los Pokémon de la PokéAPI.
- **Audio (Opcional)**: Si añades sonidos en el futuro, conecta unos altavoces.
