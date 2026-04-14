# Sigma16 Studio

Sigma16 Studio is a compiler and visualiser for the Sigma16 educational architecture.

## Installing

Pre-built binaries are available from the Releases page. Alternatively, follow the instructions below to manually install the program. 

## Prerequisites

- [Node.js](https://nodejs.org/) (with npm)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
- [wasm-pack](https://drager.github.io/wasm-pack/installer/) (for building the compiler WASM package)

## Build

### 1) Clone the repository

Make sure you pass the `--recurse-submodules` flag to clone the `sigma16-compiler` submodule as well.

```sh
git clone --recurse-submodules https://github.com/danial09/sigma16-studio.git
cd sigma16-studio
```

### 2) Install dependencies

```sh
npm install
```

### 3) Build the WebAssembly compiler package

```sh
npm run wasm-build
```

### 4) Build the frontend

```sh
npm run build
```

### 5) Build the desktop app (Tauri)

```sh
npm run tauri build
```

## Development

- Web dev server: `npm run dev`
- Desktop dev mode: `npm run tauri dev`
