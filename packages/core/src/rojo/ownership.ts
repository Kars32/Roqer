import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { SourcemapNode } from './sourcemap.js';

export type Persistence = 'file' | 'studio_only' | 'generated' | 'unsupported';

export interface Ownership {
  persistence: Persistence;
  /** Absolute real path of the source file, for file and generated. */
  file?: string;
  /** The file relative to the project folder, as shown to the caller. */
  relativeFile?: string;
  reason?: string;
}

const SCRIPT_CLASSES = new Set(['Script', 'LocalScript', 'ModuleScript']);
const isScriptFile = (file: string) => /\.luau?$/i.test(file);

/**
 * Finds the file Rojo builds a Studio script from, by walking the script's
 * name segments down Rojo's own sourcemap. Anything that cannot be matched to
 * exactly one script file is answered with why, never guessed.
 */
export function locateScript(
  tree: SourcemapNode,
  segments: string[],
  studioClassName: string | undefined,
  uniqueInStudio: boolean,
): { found: string } | Ownership {
  if (tree.className !== 'DataModel') {
    return { persistence: 'unsupported', reason: `the project's root is a ${tree.className}, not a place (DataModel)` };
  }
  if (!uniqueInStudio) {
    return { persistence: 'unsupported', reason: 'another instance on this script\'s path in Studio has the same name, so its file is ambiguous' };
  }
  let node = tree;
  for (const segment of segments) {
    // Avoid intermediate array allocation from node.children.filter() and short-circuit when >1 match is found.
    const children = node.children;
    if (!children) {
      return { persistence: 'studio_only', reason: `${segment} is not in the Rojo project; this edit is saved in Studio only` };
    }
    let match: SourcemapNode | undefined;
    let matchCount = 0;
    for (let index = 0; index < children.length; index += 1) {
      if (children[index].name === segment) {
        matchCount += 1;
        if (matchCount === 1) {
          match = children[index];
        }
      }
    }
    if (matchCount === 0 || !match) {
      return { persistence: 'studio_only', reason: `${segment} is not in the Rojo project; this edit is saved in Studio only` };
    }
    if (matchCount > 1) {
      return { persistence: 'unsupported', reason: `the project has ${matchCount} instances named ${segment} under ${node.name}, so the file is ambiguous` };
    }
    node = match;
  }
  if (!SCRIPT_CLASSES.has(node.className)) {
    return { persistence: 'unsupported', reason: `the project makes this a ${node.className}, not a script` };
  }
  if (studioClassName !== undefined && node.className !== studioClassName) {
    return { persistence: 'unsupported', reason: `Studio has a ${studioClassName} but the project makes a ${node.className}; the class does not match` };
  }
  // Avoid intermediate array allocation from node.filePaths.filter() and short-circuit when >1 script file is found.
  const filePaths = node.filePaths;
  if (!filePaths) {
    return { persistence: 'unsupported', reason: 'this script comes from a model or project file, not a script file of its own' };
  }
  let fileMatch: string | undefined;
  let fileCount = 0;
  for (let index = 0; index < filePaths.length; index += 1) {
    if (isScriptFile(filePaths[index])) {
      fileCount += 1;
      if (fileCount === 1) {
        fileMatch = filePaths[index];
      }
    }
  }
  if (fileCount === 0 || !fileMatch) {
    return { persistence: 'unsupported', reason: 'this script comes from a model or project file, not a script file of its own' };
  }
  if (fileCount > 1) {
    return { persistence: 'unsupported', reason: `this script has ${fileCount} source files, so the one to write is ambiguous` };
  }
  return { found: fileMatch };
}

/**
 * Whether a project-relative path is a source file Roqer may write: inside the
 * project folder after resolving symlinks and junctions, a .lua or .luau file,
 * and not a package or build output.
 */
export function checkFile(
  root: string,
  relativePath: string,
  ignored: (realPath: string) => boolean,
  realpath: (p: string) => string | undefined = (p) => {
    try { return fs.realpathSync.native(p); } catch { return undefined; }
  },
): Ownership {
  if (!isScriptFile(relativePath)) {
    return { persistence: 'unsupported', reason: `${path.normalize(relativePath)} is not a .lua or .luau file` };
  }
  const real = realpath(path.resolve(root, relativePath));
  if (real === undefined) {
    return { persistence: 'unsupported', reason: `${path.normalize(relativePath)} is missing on disk; check the project file` };
  }
  const relative = path.relative(root, real);
  if (relative === '' || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    return { persistence: 'unsupported', reason: `${path.normalize(relativePath)} resolves outside the project folder` };
  }
  if (relative.split(path.sep).includes('_Index') || ignored(real)) {
    return { persistence: 'generated', file: real, relativeFile: relative, reason: `${relative} is a package or build output, not source` };
  }
  return { persistence: 'file', file: real, relativeFile: relative };
}

export function scriptFiles(tree: SourcemapNode): string[] {
  const found = new Set<string>();
  // Avoid intermediate array allocations from `?? []` during recursive tree traversal.
  const visit = (node: SourcemapNode) => {
    if (SCRIPT_CLASSES.has(node.className)) {
      const filePaths = node.filePaths;
      if (filePaths) {
        for (let index = 0; index < filePaths.length; index += 1) {
          if (isScriptFile(filePaths[index])) found.add(filePaths[index]);
        }
      }
    }
    const children = node.children;
    if (children) {
      for (let index = 0; index < children.length; index += 1) {
        visit(children[index]);
      }
    }
  };
  visit(tree);
  return [...found];
}

/** The files Git ignores under root; empty when root is not in a Git repository. */
export function gitIgnored(root: string, files: string[]): Promise<Set<string>> {
  if (files.length === 0) return Promise.resolve(new Set());
  return new Promise((resolve) => {
    const child = execFile('git', ['-C', root, 'check-ignore', '--stdin', '-z'], { timeout: 10_000, maxBuffer: 8 * 1024 * 1024, windowsHide: true }, (error, stdout) => {
      // Exit 1 means none are ignored; 128 means not a repository. Either way, nothing is ignored.
      if (error && (error as { code?: unknown }).code !== 1) return resolve(new Set());
      resolve(new Set(String(stdout).split('\0').filter(Boolean).map((file) => path.resolve(root, file))));
    });
    // Git can exit (e.g. not a repository) before reading stdin; the write then fails with EPIPE.
    // The exit code above already decides the result, so a broken pipe is not an error here.
    child.stdin?.on('error', () => {});
    child.stdin?.end(files.join('\0') + '\0');
  });
}
