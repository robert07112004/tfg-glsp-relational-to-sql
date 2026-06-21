# Editor de Grafo Relacional para Visual Studio Code

Editor gráfico para el diseño de **grafos relacionales** y la **generación automática de código SQL**, desarrollado como extensión de Visual Studio Code sobre el framework [Eclipse GLSP](https://www.eclipse.org/glsp/).

Forma parte del Trabajo de Fin de Grado *"Desarrollo de un entorno web para el diseño de esquemas de bases de datos relacionales"*.

La herramienta permite construir tablas con sus atributos (clave primaria, clave alternativa, clave foránea, atributos normales y opcionales) y conectarlas mediante relaciones referenciales. Una vez validado el esquema, genera de forma automática las sentencias `CREATE TABLE` correspondientes, listas para ejecutarse en un sistema gestor de bases de datos.

## Estructura del proyecto

El proyecto está organizado como un *monorepo* gestionado con *workspaces* de Yarn, dividido en los siguientes paquetes:

- [`relational-glsp-server`](./relational-glsp-server): servidor del editor. Contiene la lógica del modelo, los manejadores de operaciones, el módulo de validación semántica y el motor de generación de SQL.
- [`relational-glsp-client`](./relational-glsp-client): cliente encargado del renderizado del diagrama y de las vistas gráficas.
- [`relational-vscode`](./relational-vscode): integración con Visual Studio Code.
  - [`extension`](./relational-vscode/extension): extensión que arranca el servidor GLSP y registra el editor personalizado.
  - [`webview`](./relational-vscode/webview): lienzo embebido que aloja al cliente dentro del editor.
- [`workspace`](./workspace): contiene archivos de ejemplo `.rmodel` que pueden abrirse con el editor.

## Requisitos previos

Para compilar y ejecutar el proyecto es necesario tener instalado en el sistema:

- [Node.js](https://nodejs.org/en/) `>= 20`
- [Yarn Classic](https://classic.yarnpkg.com/en/docs/install) `>= 1.7.0 < 2`
- [Visual Studio Code](https://code.visualstudio.com/)

Para empaquetar la extensión como archivo `.vsix` se utiliza [`@vscode/vsce`](https://github.com/microsoft/vscode-vsce), que ya viene incluido como dependencia de desarrollo del proyecto, por lo que no es necesario instalarlo de forma global.

> El usuario final que solo quiera **usar** la herramienta no necesita instalar ninguna de estas dependencias: basta con el archivo `.vsix` y Visual Studio Code (ver [Instalación de la extensión](#instalación-de-la-extensión)).

## Compilación del código fuente

Tras clonar el repositorio, instala las dependencias y compila todos los paquetes ejecutando, desde la raíz del proyecto:

```bash
yarn
```

Este comando descarga las dependencias de todos los *workspaces* y, mediante el script `prepare`, compila el código TypeScript y empaqueta el cliente y el servidor.

Si en algún momento necesitas recompilar sin reinstalar las dependencias, puedes usar:

```bash
yarn build      # compila (tsc) y empaqueta (webpack) todos los paquetes
yarn compile    # solo compila el código TypeScript
yarn clean      # elimina los artefactos de compilación
```

## Ejecución para pruebas

Para probar la extensión durante el desarrollo, abre la carpeta del proyecto en Visual Studio Code y ve a la vista **Run and Debug** (`Ctrl + Shift + D`). Hay disponibles varias configuraciones de arranque:

- **Launch Relational Diagram Extension**: abre una segunda instancia de Visual Studio Code con la extensión ya instalada. El servidor GLSP se arranca como proceso embebido. Es la opción más cómoda para probar la herramienta.
- **Launch Relational Diagram Extension (External GLSP Server)**: igual que la anterior, pero espera que el servidor GLSP se haya arrancado por separado. Útil para depurar el servidor.
- **Launch Relational GLSP Server**: arranca manualmente el proceso del servidor GLSP. Permite poner puntos de interrupción en el código del servidor.
- **Launch Relational Diagram extension with external GLSP Server**: configuración compuesta que arranca a la vez la extensión (en modo servidor externo) y el servidor GLSP, permitiendo depurar simultáneamente cliente y servidor.

Una vez lanzada la segunda instancia, abre la carpeta `workspace` y haz doble clic sobre cualquier archivo `.rmodel` para abrirlo con el editor de grafo relacional.

Como alternativa, durante el desarrollo activo puedes mantener la recompilación automática en marcha con:

```bash
yarn watch
```

## Generación del archivo `.vsix`

Para empaquetar la extensión como un archivo `.vsix` distribuible, ejecuta desde la raíz del proyecto:

```bash
yarn package
```

Este comando compila y empaqueta todo el proyecto e invoca internamente a `vsce package`. El archivo resultante, `relational-vscode-<versión>.vsix`, se genera dentro de la carpeta [`relational-vscode/extension`](./relational-vscode/extension).

## Instalación de la extensión

Con el archivo `.vsix` ya generado, puede instalarse en Visual Studio Code de dos maneras:

- **Desde la interfaz**: abre la vista de extensiones (`Ctrl + Shift + X`), despliega el menú `...` de la esquina superior y elige *Install from VSIX...*, seleccionando el archivo generado.
- **Desde la terminal**:

  ```bash
  code --install-extension relational-vscode-2.5.0.vsix
  ```

Una vez instalada, la extensión se activa automáticamente al iniciar Visual Studio Code. Cualquier archivo con extensión `.rmodel` se abrirá directamente con el editor de grafo relacional.

## Uso básico

1. Crea un archivo con extensión `.rmodel` y ábrelo para mostrar el lienzo y la paleta de herramientas.
2. Haz clic en un elemento de la paleta y después en el lienzo para colocarlo. Los atributos se sueltan dentro de una tabla existente.
3. Para crear una relación, selecciona la arista en la paleta, haz clic en el atributo de origen (clave foránea) y después en el de destino.
4. Pulsa el botón de **validación** para comprobar el esquema. Los errores se muestran como marcadores sobre los elementos afectados.
5. Cuando la validación no detecta errores, aparece el botón de **generación de SQL**. Al pulsarlo se crea un archivo `.sql` junto al modelo con las sentencias `CREATE TABLE`.

## Licencia

Este proyecto se distribuye bajo la licencia EPL-2.0, heredada de la plantilla base de Eclipse GLSP.
