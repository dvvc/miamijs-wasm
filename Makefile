EMCC=emcc

.PHONY: clean
all: process.wasm

process.wasm: process.c
	${EMCC} $< -Os -s WASM=1 -s SIDE_MODULE=1 -s BINARYEN_ASYNC_COMPILATION=0 -o $@

clean:
	rm -rf process.wasm
