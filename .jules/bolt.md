# Bolt's Journal

Critical learnings only. Do not log routine optimizations.

## 2026-10-10 - PNG Chunk Buffer Pre-allocation vs Deflate Compression
**Learning:** In image encoders like `rgbaToPng`, attempting to optimize chunk allocations (`Buffer.allocUnsafe`, single chunk buffer layout, avoiding `Buffer.concat` before CRC calculation) yielded negligible performance improvement (-3% to 0% delta). Profiling demonstrated that synchronous zlib deflation (`deflateSync`) consumes over 95% of total runtime, completely dwarfing buffer allocation overhead.
**Action:** In data pipelines involving compression or encryption (zlib, crypto), always profile the compression step before attempting memory allocation or chunk-packing optimizations.

## 2026-10-11 - Levenshtein Buffer Pre-allocation & Catalog Pre-normalization
**Learning:** In string fuzzy-matching over large catalogs (e.g. `recommendRobloxDocs`), allocating `Array.from()` inside `editDistance` created thousands of transient arrays per search request (~23.8ms per query). Pre-normalizing candidate strings upon catalog creation and reusing a single static `Int32Array` work buffer inside `editDistance` cut search execution time by >70% (~7.2ms per query) while completely eliminating per-search allocations.
**Action:** When performing Levenshtein or edit distance matching over large static collections, always pre-normalize candidate names in the collection cache and reuse a single typed array work buffer for row calculations.
