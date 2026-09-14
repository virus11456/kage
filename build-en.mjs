#!/usr/bin/env node
/* Generates the English pages under en/ from the Chinese index.html and
   engine.html, using the dictionary in secret-pathways-assets/i18n.js.
   Run after any copy change:   node build-en.mjs
   Every text node and every aria-label / alt / title whose trimmed text is
   a dictionary key is swapped; the document language, title, description,
   Open Graph locale, hreflang links, asset paths, the language toggle and a
   few page-specific strings are rewritten too. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DICT = require(path.join(ROOT, 'secret-pathways-assets', 'i18n.js'));
const SITE = 'https://simples.com.tw/';

/* Every *.html at the root is a page. Give each one its English title and
   description here; a page missing from this table is still built, with its
   Chinese title and description passed through the dictionary. */
const META = [
  { src: 'index.html', title: 'Simples | Every good idea deserves to land',
    description: 'Simples is a Taipei marketing consultancy that works with AI and systems thinking. Strategy, search, media, reputation, AI deployment — turning "why customers buy" into a system that can be understood, repeated and scaled.',
    ogTitle: 'Simples | Every good idea deserves to land', ogDesc: 'A marketing consultancy that works with AI and systems thinking. Strategy, search, media, reputation, AI deployment.' },
  { src: 'engine.html', title: 'AI Creative Engine | Simples',
    description: "Simples' AI creative production line: brand system first, angles × versions, every format at once, live in 48 hours, results fed back.",
    ogTitle: 'AI Creative Engine | Simples', ogDesc: "Simples' AI creative production line: brand system first, angles × versions, every format, live in 48 hours." }
];
const PAGES = fs.readdirSync(ROOT).filter(f => /\.html$/.test(f)).sort().map(src => {
  const m = META.find(x => x.src === src);
  if (m) return m;
  console.warn('no English meta for ' + src + ' — add it to META in build-en.mjs; using the dictionary for its title');
  const html = fs.readFileSync(path.join(ROOT, src), 'utf8');
  const t = (html.match(/<title>([^<]*)<\/title>/) || [, src])[1], d = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
  return { src, title: DICT[t] || t, description: DICT[d] || d, ogTitle: DICT[t] || t, ogDesc: DICT[d] || d };
});
const NAV_ALT = { About: '我們怎麼想', Work: '案例', Services: '服務', Engine: '素材引擎', Contact: '聯絡' };
const RAIL_EN = "['Top', 'How we think', 'Work', 'Services', 'Contact', 'Colophon']";
const RAIL_ZH = "['首頁', '我們怎麼想', '案例', '服務', '聯絡', '頁尾']";

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function translate(html) {
  /* text nodes: everything between a closing > and an opening <, outside
     script and style, where the trimmed text is a key */
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(/>([^<>]+)</g, (m, text) => {
      const key = unesc(text).replace(/\s+/g, ' ').trim();
      if (!key || !DICT[key]) return m;
      const lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0];
      return '>' + lead + esc(DICT[key]) + tail + '<';
    });
    parts[i] = parts[i].replace(/(aria-label|alt|title)="([^"]*)"/g, (m, attr, v) => {
      const key = unesc(v).trim();
      return DICT[key] ? attr + '="' + esc(DICT[key]) + '"' : m;
    });
  }
  return parts.join('');
}

function build(page) {
  let s = fs.readFileSync(path.join(ROOT, page.src), 'utf8');
  s = translate(s);
  /* document identity */
  s = s.replace('<html lang="zh-TW">', '<html lang="en" data-lang="en">');
  s = s.replace(/<title>[^<]*<\/title>/, '<title>' + esc(page.title) + '</title>');
  s = s.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + esc(page.description) + '">');
  s = s.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + esc(page.ogTitle) + '">');
  s = s.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + esc(page.ogDesc) + '">');
  s = s.replace('<meta property="og:locale" content="zh_TW">', '<meta property="og:locale" content="en_US">');
  const p = page.src === 'index.html' ? '' : page.src;
  s = s.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + SITE + 'en/' + p + '">');
  /* assets live one level up */
  s = s.replace(/(href|src)="(secret-pathways-assets\/|assets\/)/g, '$1="../$2');
  s = s.replace(/url\('secret-pathways-assets\//g, "url('../secret-pathways-assets/");
  /* the toggle points back at the Chinese document */
  s = s.replace(/<a class="lang" href="en\/[^"]*" hreflang="en"[^>]*>[\s\S]*?<\/a>/,
    '<a class="lang" href="../' + page.src + '" hreflang="zh-Hant-TW" data-cursor aria-label="中文版"><span data-l="zh">中</span><i>/</i><span data-l="en" class="on">EN</span></a>');
  /* the nav's hover line shows the other language */
  s = s.replace(/<span class="alt">([A-Za-z ]+)<\/span>/g, (m, en) => NAV_ALT[en] ? '<span class="alt">' + NAV_ALT[en] + '</span>' : m);
  /* the two taglines mirror each other */
  s = s.replace(/(class="(?:hero-en eyebrow|foot-en)"[^>]*>)Every good idea deserves to land\./g, '$1讓每個好點子都可以落地。');
  /* the engine's status line lives in its script */
  s = s.replace("'ENGINE · 15 組完成 · 48H'", "'ENGINE · 15 SETS DONE · 48H'");
  /* the chapter rail */
  s = s.replace(RAIL_ZH, RAIL_EN);
  /* links between the English pages stay inside en/ (they are relative already) */
  const out = path.join(ROOT, 'en', page.src);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, s);
  const left = (s.match(/[一-鿿]{2,}/g) || []).filter(t => !/簡單行銷|讓每個好點子都可以落地|玉門街|圓山/.test(t));
  console.log('wrote', path.relative(ROOT, out), left.length ? '— untranslated: ' + [...new Set(left)].slice(0, 12).join(' / ') : '— clean');
}

PAGES.forEach(build);
