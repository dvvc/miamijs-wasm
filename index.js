(function() {
  const PBR_WASM = 'process.wasm';

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;

  const CANVAS_PIXELS = CANVAS_WIDTH * CANVAS_HEIGHT;
  const CANVAS_BYTES = CANVAS_PIXELS * 4; // #RGBA

  const WASM_PAGESIZE = 64 * 1024;

  /**
   * Loads an image and draws it on the canvas
   *
   */
  function drawImage(ctx) {
    let image = new Image();
    image.src = '/wasm.png';

    image.onload = () => {
      ctx.drawImage(image, 0, 0);
    };
  }

  /**
   * Load and instantiate the WASM module
   */
  function loadModule(memory) {
    let importObject = {
      env: {
        memoryBase: 0,
        memory: memory,
        tableBase: 0,
        abort: () => {},
        table: new WebAssembly.Table({
          initial: 4,
          element: 'anyfunc',
        }),
        _print_int: console.log,
      },
    };

    // Disable caching for WASM module
    let headers = new Headers({
      pragma: 'no-cache',
      'cache-control': 'no-cache',
    });

    return WebAssembly.instantiateStreaming(fetch(PBR_WASM, { headers }), importObject);
  }

  /**
   * Call the external `render` function from the WASM module, which assigns green pixels to the
   * memory buffer
   *
   */
  function externalRender(renderF, ctx, memory, width, height) {
    let start = new Date();
    // This is the Wasm function, it will set the memory buffer contents
    renderF(memory, width, height);
    console.log(`Render: ${new Date() - start}ms`);

    // Create an ImageData from the shared Wasm memory
    let u8Buffer = new Uint8ClampedArray(memory.buffer, 0, CANVAS_BYTES);
    let imageData = new ImageData(u8Buffer, width, height);

    // Draw the image to the canvas
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Convert whatever is on the canvas to grayscale
   *
   */
  function externalProcess(processF, ctx, memory, width, height) {
    // Get the current canvas image as an ImageData object
    let imageData = ctx.getImageData(0, 0, width, height);

    let memoryBuffer = new Uint8ClampedArray(memory.buffer, 0, CANVAS_BYTES);

    // Transfer the image data pixels to the Wasm shared buffer
    for (let i = 0; i < CANVAS_BYTES; i++) {
      memoryBuffer[i] = imageData.data[i];
    }

    // Call the Wasm process function, which will update the memory buffer
    processF(memory, width, height);

    // Create a new ImageData object and render it to the canvas
    imageData = new ImageData(memoryBuffer, width, height);
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Main function: Set all button handlers and load the Wasm module
   */
  function init() {
    let canvas = document.getElementById('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    let wasmLoaded = document.getElementById('wasm-loaded');
    let memory = new WebAssembly.Memory({ initial: 256 });

    // Load the Wasm module using the pre-created memory buffer
    loadModule(memory)
      .then(result => {
        let instance = result.instance;

        // Update the 'Wasm loaded' indicator
        wasmLoaded.className = 'loaded';

        let ctx = canvas.getContext('2d');

        // When clicking the render button, call the Wasm `render` function and render the memory
        // to the canvas
        let renderBtn = document.getElementById('render-btn');
        renderBtn.addEventListener('click', () =>
          externalRender(instance.exports._render, ctx, memory, CANVAS_WIDTH, CANVAS_HEIGHT)
        );

        // When clicking the draw image button, load and render an image to the canvas
        let drawImgBtn = document.getElementById('draw-image-btn');
        drawImgBtn.addEventListener('click', () => drawImage(ctx));

        // When clicking the process button, convert the canvas contents to grayscale by calling
        // the `process` Wasm function
        let processImgBtn = document.getElementById('process-image-btn');
        processImgBtn.addEventListener('click', () =>
          externalProcess(instance.exports._process, ctx, memory, CANVAS_WIDTH, CANVAS_HEIGHT)
        );
      })
      .catch(e => {
        console.error(e);
      });
  }

  window.onload = init;
})();
