const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'CODEBASE_MAP.md';
const IGNORE_DIRS = ['node_modules', 'dist', 'dist-tv', 'dist-tv-out', '.git', '.qoder', 'build', 'assets', 'sounds', 'public', '.vscode', '.next', 'tools'];
const IGNORE_FILES = ['generate-map.cjs', 'vite.config.ts', 'vite.config.js', 'tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js', 'eslint.config.js'];
const VALID_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.html', '.mjs'];

function collectFiles(dirPath = process.cwd(), fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        collectFiles(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (VALID_EXTS.includes(ext) && !IGNORE_FILES.includes(entry.name)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function findBlockEndLine(lines, startIndex) {
  let braceCount = 0;
  let foundOpening = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
      if (char === '{') {
        braceCount++;
        foundOpening = true;
      } else if (char === '}') {
        braceCount--;
      }
    }
    if (foundOpening && braceCount <= 0) {
      return i + 1;
    }
  }
  return Math.min(startIndex + 20, lines.length);
}

function parseFileSymbols(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const symbols = [];
  let importEndLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const lineNum = i + 1;

    if (trimmed.startsWith('import ')) {
      importEndLine = lineNum;
      continue;
    }

    // Section comments like // === SECTION === or // --- Section ---
    const sectionMatch = trimmed.match(/^\/\/\s*[=-]{3,}\s*(.+?)\s*[=-]*$/);
    if (sectionMatch) {
      symbols.push({ name: `Section: ${sectionMatch[1]}`, type: 'Section', start: lineNum, end: lineNum });
      continue;
    }

    // Function declarations
    const funcMatch = trimmed.match(/^(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/);
    if (funcMatch) {
      const endLine = findBlockEndLine(lines, i);
      symbols.push({ name: `${funcMatch[1]}()`, type: 'Function/Component', start: lineNum, end: endLine });
      i = endLine - 1;
      continue;
    }

    // Arrow functions & React components
    const arrowMatch = trimmed.match(/^(?:export\s+(?:default\s+)?)?(?:const|let)\s+([a-zA-Z0-9_$]+)\s*(?::[^=]+)?=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/);
    if (arrowMatch) {
      const endLine = findBlockEndLine(lines, i);
      symbols.push({ name: `${arrowMatch[1]}()`, type: 'Arrow Fn/Component', start: lineNum, end: endLine });
      i = endLine - 1;
      continue;
    }

    // Interfaces / Types
    const typeMatch = trimmed.match(/^(?:export\s+)?(?:interface|type)\s+([a-zA-Z0-9_$]+)/);
    if (typeMatch) {
      const endLine = trimmed.includes('{') ? findBlockEndLine(lines, i) : lineNum;
      symbols.push({ name: typeMatch[1], type: 'Type/Interface', start: lineNum, end: endLine });
      i = endLine - 1;
    }
  }

  return { totalLines: lines.length, importEndLine, symbols };
}

function generateMap() {
  const allFiles = collectFiles();

  let md = `# Codebase Map (Ansari Medical Hall - Patient Manager)\n`;
  md += `> **AI Agent Instruction:** Always read this map first to locate exact line ranges, then use \`read_file\` with \`start_line\` and \`end_line\` instead of reading entire files.\n\n`;
  md += `_Last Updated: ${new Date().toLocaleString()}_ | _Total Files: ${allFiles.length}_\n\n---\n\n`;

  for (const fullPath of allFiles) {
    const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
    const { totalLines, importEndLine, symbols } = parseFileSymbols(fullPath);

    md += `### \`${relPath}\` (${totalLines} lines)\n`;
    if (importEndLine > 0) {
      md += `- **Imports:** \`L1 - L${importEndLine}\`\n`;
    }
    if (symbols.length > 0) {
      symbols.forEach(sym => {
        md += `- **${sym.name}** _(${sym.type})_: \`L${sym.start} - L${sym.end}\`\n`;
      });
    } else {
      md += `- _Config/Constants/Entry file:_ \`L1 - L${totalLines}\`\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(path.join(process.cwd(), OUTPUT_FILE), md, 'utf-8');
  console.log(`✅ Success! Generated ${OUTPUT_FILE} covering ${allFiles.length} files.`);
}

generateMap();