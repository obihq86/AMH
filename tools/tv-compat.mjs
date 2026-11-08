// dist-tv বিল্ডের CSS-কে পুরোনো টিভি-ব্রাউজারের (Chromium 79) ভাষায় নামিয়ে আনে।
// Tailwind v4 আউটপুটে oklch()/color-mix()/@layer/@property/:is()/:where()/inset/dvh থাকে —
// এগুলো parse না হলে পুরো পাতা খালি দেখায় বা স্পেসিং/রং উঠে যায়।
//
// কেন preset-env-কে cascade-layers বন্ধ করে দিই:
// preset-env পুরোনো ব্রাউজারে Tailwind-এর @layer polyfill করবে বলে প্রতিটি
// @property-ডিফল্টকে `*:not(#\#):not(#\#)...` আকারে বসায় (১১ হাজার বার)। `#\#`
// CSS4 identifier, Chrome 88+ এটাই পুরো সিলেক্টর ফেলিয়ে দেয় — অর্থাৎ polyfill-এর
// ছুঁয়েই সব CSS-ই মরে যাচ্ছিল। বরং @layer নিজেই unwrap করি (নিচের layerUnwrap),
// আর @property-এর initial-value গুলো specificity-0 রুলে বসাই — @property-এর
// "any"-মানের মতো সব ইউটিলিটি ক্লাসই সেটা হারিয়ে দেয়, তাই ক্যাসকেড ঠিক থাকে।
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import presetEnv from 'postcss-preset-env';

const ROOT = path.resolve('dist-tv');
const ASSETS = path.join(ROOT, 'assets');

// বিল্ড-আউট লক এড়াতে raw build অপরিবর্তিত রেখে copy-তেই কাজ করি: টিভিতে যাবে dist-tv-out।
const OUT = path.resolve('dist-tv-out');
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(ROOT, OUT, { recursive: true });
const OUT_ASSETS = path.join(OUT, 'assets');

const splitSelectorList = (selector) => {
  const out = [];
  let depth = 0, escaped = false, current = '';
  for (const ch of selector) {
    if (escaped) { escaped = false; current += ch; continue; }
    if (ch === '\\') { escaped = true; current += ch; continue; }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
};

// :where(a, b) → a, b (প্রতিটি বিকল্প পুরো সিলেক্টরে ছড়িয়ে দিই) — :where Chrome 88+
const expandWhere = (sel) => {
  const i = sel.indexOf(':where(');
  if (i < 0) return [sel];
  let depth = 0, end = -1;
  for (let j = i + ':where'.length; j < sel.length; j++) {
    if (sel[j] === '(') depth++;
    else if (sel[j] === ')' && --depth === 0) { end = j; break; }
  }
  if (end < 0) return [sel];
  const out = [];
  for (const option of splitSelectorList(sel.slice(i + ':where('.length, end))) {
    for (const one of splitSelectorList(sel.slice(0, i) + option + sel.slice(end + 1))) out.push(...expandWhere(one));
  }
  return out;
};

const whereExpand = () => ({
  postcssPlugin: 'amh-where-expand',
  Rule(rule) {
    if (rule.selector.indexOf(':where(') < 0) return;
    const expanded = [];
    for (const s of expandWhere(rule.selector)) if (!expanded.includes(s)) expanded.push(s);
    rule.selector = expanded.join(',');
  }
});

// CSS Nesting (Chrome 112+) — `&` কে প্যারেন্ট সিলেক্টর দিয়ে বদলে দিই।
// `&:hover` → `.a:hover`, `& .b` → `.a .b`, `.a { &:is(.b) {...} }` → `.b { ... }` (Tailwind-এর সাব-সিলেক্টর ইডিওম)।
const nestFlat = (base, rest) => rest.split(',').map((part) => {
  const p = part.trim();
  if (p.startsWith('&')) return base + p.slice(1);
  if (/^::/.test(p)) return base + p;
  if (/^:[a-z-]/.test(p)) return base + p;
  return base + ' ' + p;
});

const nestingFlatten = () => ({
  postcssPlugin: 'amh-nesting-flatten',
  OnceExit(root) {
    let changed = true;
    while (changed) {
      changed = false;
      root.walkRules((rule) => {
        if (!rule.some((n) => n.type === 'rule' || n.type === 'atrule')) return;
        const parents = [];
        for (let p = rule.parent; p && p.type === 'rule'; p = p.parent) parents.unshift(p);
        if (!parents.length) return;
        const base = parents.map((p) => p.selector).reduce((acc, sel) => nestFlat(acc, sel));
        for (const child of [...rule.nodes]) {
          if (child.type !== 'rule' && child.type !== 'atrule') continue;
          const flat = child.type === 'rule' ? nestFlat(base, child.selector) : base;
          const cloned = child.clone({ nodes: [] });
          if (child.type === 'rule') cloned.selector = flat;
          else cloned.append(child.clone());
          rule.parent.insertBefore(rule, cloned);
          child.remove();
        }
        rule.selector = base;
        changed = true;
      });
    }
  }
});

// @layer a { r } → r (order ঠিক রেখে হোইস্ট)। Tailwind-এর নিজের 'properties' লেয়ারটা
// শুধু পুরোনো ব্রাউজারের জন্য @property-এর নকল — সেটা propertyFallback সামলায়, তাই ফেলে দিই।
const layerUnwrap = () => ({
  postcssPlugin: 'amh-layer-unwrap',
  OnceExit(root) {
    let changed = true;
    while (changed) {
      changed = false;
      root.walkAtRules('layer', (at) => {
        if (at.nodes) {
          for (const child of [...at.nodes]) root.insertBefore(at, child);
        }
        at.remove();
        changed = true;
      });
    }
  }
});

const insetExpand = () => ({
  postcssPlugin: 'amh-inset-expand',
  Declaration(decl) {
    if (decl.prop !== 'inset' || !decl.parent || decl.parent.type !== 'rule') return;
    const parts = decl.value.trim().split(/\s+/);
    if (parts.length > 4 || parts.some((p) => /var\(|env\(/.test(p))) return;
    const [top, right = top, bottom = top, left = right] = parts;
    decl.cloneBefore({ prop: 'top', value: top });
    decl.cloneBefore({ prop: 'right', value: right });
    decl.cloneBefore({ prop: 'bottom', value: bottom });
    decl.cloneBefore({ prop: 'left', value: left });
    decl.remove();
  }
});

const VIEWPORT_UNITS = /(dvh|svh|lvh|dvw|svw|lvw|dvi|svi|lvi|dvb|svb|lvb|dvmn|dvmx|svmn|svmx|lvmn|lvmx)\b/g;
const viewportFallback = () => ({
  postcssPlugin: 'amh-viewport-fallback',
  Declaration(decl) {
    if (!VIEWPORT_UNITS.test(decl.value)) return;
    VIEWPORT_UNITS.lastIndex = 0;
    const fallback = decl.value.replace(VIEWPORT_UNITS, (m, u) => (u.endsWith('h') ? 'vh' : u.endsWith('w') ? 'vw' : 'vmin'));
    if (fallback !== decl.value) decl.cloneBefore({ value: fallback });
  }
});

// @property {initial-value} → specificity-0 রুল (@property-এর 'any' সেমানানুযায়ী)।
const propertyFallback = () => ({
  postcssPlugin: 'amh-property-fallback',
  Once(root) {
    const own = [];
    const inherited = [];
    root.walkAtRules('property', (at) => {
      const name = at.params.trim().replace(/^--?/, '');
      let initial = null, inherits = false;
      at.walkDecls((decl) => {
        if (decl.prop === 'initial-value') initial = decl.value;
        if (decl.prop === 'inherits') inherits = decl.value === 'true';
      });
      if (!initial) return;
      (inherits ? inherited : own).push({ prop: `--${name}`, value: initial });
    });
    const mk = (selector, items) => {
      const r = postcss.rule({ selector });
      for (const d of items) r.append(postcss.decl({ prop: d.prop, value: d.value }));
      return r;
    };
    // প্রথমে prepend হওয়াটি শেষে বসে, তাই inherited (:root) আগে।
    if (inherited.length) root.prepend(mk(':root', inherited));
    if (own.length) root.prepend(mk('*', own));
    return own.length + inherited.length;
  }
});

const cssFiles = fs.readdirSync(OUT_ASSETS).filter((f) => f.endsWith('.css'));
const report = [];
for (const file of cssFiles) {
  const full = path.join(OUT_ASSETS, file);
  const before = fs.readFileSync(full, 'utf8');
  const out = await postcss([
    presetEnv({
      overrideBrowserslist: ['chrome >= 79'], stage: 2, autoprefixer: {},
      features: { 'cascade-layers': false }
    }),
    layerUnwrap(),
    propertyFallback(),
    nestingFlatten(),
    whereExpand(),
    insetExpand(),
    viewportFallback()
  ]).process(before, { from: full });
  fs.writeFileSync(full, out.css);
  const count = (re) => (out.css.match(re) || []).length;
  report.push({
    file,
    bytesBefore: before.length,
    bytesAfter: out.css.length,
    hardBreakersLeft: {
      oklch: count(/oklch\(/g), lab: count(/[^a-z]lab\(/g), lch: count(/[^a-z]lch\(/g),
      layer: count(/@layer/g), is: count(/:is\(/g), where: count(/:where\(/g),
      inset: count(/[{;]\s*inset\s*:/g), nesting: count(/&[.:[]/g),
      selectorLevel4Not: count(/:not\([^)]*[ >+~][^)]*\)/g) + count(/:not\(#\\\#\)/g),
      color4Relative: count(/rgb\(from /g) + count(/hsl\(from /g),
      contrastColor: count(/contrast-color\(/g),
      lightDark: count(/light-dark\(/g)
    },
    stillModern: {
      dvhUses: count(/dvh/g),
      propertyAtRule: count(/@property/g),
      focusVisible: count(/:focus-visible/g),
      colorMixOutsideSupports: count(/color-mix\(/g) - count(/@supports \(color:color-mix/g),
      flexGapClasses: count(/\bgap-/g)
    }
  });
}

const indexFile = path.join(OUT, 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');
const stripped = html.replace(/<script>\s*if \('serviceWorker' in navigator\)[\s\S]*?<\/script>/, '<!-- service worker disabled for TV build -->');
if (stripped === html) console.warn('WARNING: service worker registration not found in index.html');
fs.writeFileSync(indexFile, stripped);

console.log(JSON.stringify({ report, swRemoved: stripped !== html, out: OUT }, null, 1));
