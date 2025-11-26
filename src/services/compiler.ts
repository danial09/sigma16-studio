import { CompilerOptions, CompilationResult } from '@/types/compiler.types';
import init, { compile_snapshot } from 's16-wasm';

let wasmInitPromise: Promise<unknown> | null = null;

async function ensureWasmReady() {
  if (!wasmInitPromise) {
    wasmInitPromise = init().catch((err) => {
      wasmInitPromise = null;
      throw err;
    });
  }
  await wasmInitPromise;
}

export async function compileSource(
  source: string,
  options: CompilerOptions
): Promise<CompilationResult> {
  await ensureWasmReady();

  const compilerOptions = {
    emit_ir: true,
    emit_asm: options.emitAsm,
    allocator: options.allocator,
    include_mappings: true,
    include_groups: true,
  };

  try {
    const result = compile_snapshot(source, compilerOptions);
    return result as CompilationResult;
  } catch (error) {
    return {
      success: false,
      error: String(error),
    } as CompilationResult;
  }
}
