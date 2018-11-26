# Wasm image processing

This is a simple proof of concept of a web application that uses the HTML Canvas
and WebAssembly to load an image and process it efficiently.

## Code structure

The code consists of a web application (`index.html` and `index.js`) and a
couple C functions in `process.c`. The `process.c` contents are compiled using
some toolchain that can generate a Wasm module, such as Emscripten SDK.

The Javascript code loads the generated `process.wasm` module and executes
external functions in Wasm to draw on the canvas.

## Running

There are no external dependencies to run the code. Just serve the entire
directory with a web server that supports the wasm MIME type
[serve](https://www.npmjs.com/package/serve) is recommended, others like
Python's `SimpleHTTPServer` won't work out of the box.

After the contents are served, just visit `index.html` in a browser.


## Building

If you want to build the C source code as a Wasm module, download and install a
toolchain like [Emscripten
SDK](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)
and ensure the `emcc` compiler is in your path (or edit the `Makefile`
accordingly). Then run `make clean` and `make`. This should generate a new
`process.wasm` file.

## License

This code is licensed under the MIT license.
