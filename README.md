# Sigma16 Studio

Sigma16 Studio is a compiler and visualiser for the Sigma16 educational architecture.

## Prerequisites

- [Node.js](https://nodejs.org/) (with npm)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
- [wasm-pack](https://drager.github.io/wasm-pack/installer/) (for building the compiler WASM package)

## Build

### 1) Install dependencies

```sh
npm install
```

### 2) Build the WebAssembly compiler package

```sh
npm run wasm-build
```

### 3) Build the frontend

```sh
npm run build
```

### 4) Build the desktop app (Tauri)

```sh
npm run tauri build
```

## Development

- Web dev server: `npm run dev`
- Desktop dev mode: `npm run tauri dev`
