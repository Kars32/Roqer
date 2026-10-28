# Bolt's Journal

Critical learnings only. Do not log routine optimizations.

## 2026-10-10 - PNG Chunk Buffer Pre-allocation vs Deflate Compression
**Learning:** In image encoders like `rgbaToPng`, attempting to optimize chunk allocations (`Buffer.allocUnsafe`, single chunk buffer layout, avoiding `Buffer.concat` before CRC calculation) yielded negligible performance improvement (-3% to 0% delta). Profiling demonstrated that synchronous zlib deflation (`deflateSync`) consumes over 95% of total runtime, completely dwarfing buffer allocation overhead.
**Action:** In data pipelines involving compression or encryption (zlib, crypto), always profile the compression step before attempting memory allocation or chunk-packing optimizations.

## 2026-10-28 - Baseline Hand-Rolled JPEG Encoder Buffer Pre-allocation & Fast-Path
**Learning:** Unlike PNG encoding where zlib compression dominates runtime, custom baseline JPEG encoding (`rgbaToJpeg`) bottlenecked on array push resizes and per-pixel edge clamping math. Pre-allocating a `Uint8Array` buffer and introducing a fast-path loop for non-boundary 8x8 macroblocks yielded a ~35% speedup (275ms -> 180ms at 1080p).
**Action:** For uncompressed/hand-rolled pixel encoders without external native binaries, optimize typed array re-allocation and unroll sampling loops for internal grid tiles.
