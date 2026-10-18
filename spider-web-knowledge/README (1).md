:root {
  --void: #0b0c0f; --base: #111111; --p1: #18191d; --p2: #202126; --p3: #292b31;
  --accent: #7a82e6; --accent-hover: #9299ef; --accent-active: #5c65c0;
  --node: #d8dce5; --hub: #b8c0ff;
  --ok: #72d6a3; --warn: #d29922; --bad: #f85149; --ai: #c6a8ff;
  --text: #dcddde; --muted: #8b949e; --faint: #4b535b;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px; --line: rgba(180, 188, 220, .12);
}
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { background: var(--base); color: var(--text); font: 14px/1.55 var(--font); display: grid; grid-template-rows: 44px minmax(0, 1fr) 38vh; overflow: hidden; }
button, input, select, textarea { font: inherit; color: inherit; }
button { background: var(--p2); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 4px 10px; cursor: pointer; }
button:hover { background: var(--p3); }
button.primary { background: var(--accent-active); border-color: var(--accent); }
button.primary:hover { background: var(--accent); }
button:disabled { opacity: .45; cursor: default; }
:focus-visible { outline: 2px solid var(--accent-hover); outline-offset: 1px; }
kbd { font: 11px var(--mono); color: var(--muted); border: 1px solid var(--line); border-radius: 3px; padding: 0 4px; margin-left: 6px; }
.muted { color: var(--muted); }

#top { display: flex; align-items: center; gap: 12px; padding: 0 12px; background: var(--void); border-bottom: 1px solid var(--line); }
.brand { font-weight: 600; letter-spacing: .02em; white-space: nowrap; }
.brand-mark { color: var(--accent); margin-right: 8px; text-shadow: 0 0 12px rgba(122, 130, 230, .6); }
.search { flex: 1; max-width: 460px; text-align: left; color: var(--muted); background: var(--p1); }
.top-actions { margin-left: auto; display: flex; gap: 8px; }

#ws { display: grid; grid-template-columns: 240px minmax(0, 1fr) 330px; min-height: 0; }
#explorer, #context { background: var(--p1); overflow: auto; min-height: 0; }
#explorer { border-right: 1px solid var(--line); padding: 8px 0; }
#context { border-left: 1px solid var(--line); }
.pane-title { padding: 4px 14px 8px; color: var(--muted); font-size: 12px; }
#tree details { margin: 0; }
#tree summary { padding: 3px 14px; cursor: pointer; color: var(--muted); user-select: none; }
#tree summary:hover { color: var(--text); }
#tree .leaf { display: flex; gap: 8px; width: 100%; text-align: left; border: 0; border-radius: 0; background: none; padding: 3px 14px 3px 28px; color: var(--text); }
#tree .leaf:hover { background: var(--p2); }
#tree .leaf.on { background: var(--p3); box-shadow: inset 2px 0 var(--accent); }
#tree .leaf.pending { color: var(--muted); font-style: italic; }
.g { font-style: normal; display: inline-block; width: 1.1em; text-align: center; }
.g.ok { color: var(--ok); } .g.ai { color: var(--ai); } .g.warn { color: var(--warn); } .g.bad { color: var(--bad); font-weight: 700; } .g.hub { color: var(--hub); } .g.faint { color: var(--faint); }

#editor { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--base); }
.ed-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 16px; border-bottom: 1px solid var(--line); min-height: 44px; }
.ed-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 10px; min-width: 0; }
.ed-title #ed-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ed-actions { display: flex; gap: 8px; }
.badge { font-size: 12px; font-weight: 400; border: 1px solid currentColor; border-radius: 99px; padding: 0 8px; white-space: nowrap; }
.badge.ok { color: var(--ok); } .badge.ai { color: var(--ai); } .badge.warn { color: var(--warn); } .badge.bad { color: var(--bad); }
.empty { margin: auto; text-align: center; padding: 24px; color: var(--text); }
#raw { flex: 1; width: 100%; resize: none; border: 0; background: var(--base); padding: 16px 24px; font: 13px/1.65 var(--mono); outline-offset: -2px; tab-size: 2; }
#preview { flex: 1; overflow: auto; padding: 20px 32px 48px; }
#preview > * { max-width: 72ch; }
#preview h1 { font-size: 26px; margin: .2em 0 .5em; } #preview h2 { font-size: 19px; margin: 1.4em 0 .4em; } #preview h3 { font-size: 16px; }
#preview code { font-family: var(--mono); background: var(--p2); padding: 1px 5px; border-radius: var(--r-sm); font-size: 12.5px; }
#preview pre { background: var(--p1); border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px 14px; overflow: auto; }
#preview pre code { background: none; padding: 0; }
#preview blockquote { margin: .6em 0; padding-left: 12px; border-left: 2px solid var(--accent-active); color: var(--muted); }
#preview a { color: var(--accent-hover); }
a.wl { color: var(--accent-hover); text-decoration: none; border-bottom: 1px solid rgba(146, 153, 239, .4); cursor: pointer; }
a.wl:hover { border-bottom-color: var(--accent-hover); }
a.wl.ghost { color: var(--muted); border-bottom-style: dashed; }
.rel { color: var(--muted); font-size: 12.5px; margin-right: 4px; }
.tag { color: var(--accent-hover); background: rgba(122, 130, 230, .12); border-radius: 99px; padding: 0 8px; font-size: 12.5px; }
.ai-mark { color: var(--ai); }
table.props { border-collapse: collapse; margin-bottom: 18px; font-size: 12.5px; color: var(--muted); }
table.props td { padding: 1px 14px 1px 0; vertical-align: top; } table.props td:first-child { color: var(--faint); }

.tabs { display: flex; border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--p1); z-index: 2; }
.tabs button { flex: 1; border: 0; border-radius: 0; background: none; padding: 9px 4px; color: var(--muted); border-bottom: 2px solid transparent; }
.tabs button[aria-selected=true] { color: var(--text); border-bottom-color: var(--accent); }
.tabs b { color: var(--bad); margin-left: 4px; }
#tab-body { padding: 14px 16px 28px; }
#tab-body h3 { margin: 0 0 6px; font-size: 16px; } #tab-body h4 { margin: 18px 0 6px; font-size: 12.5px; color: var(--muted); font-weight: 600; }
.kv { display: flex; justify-content: space-between; gap: 8px; padding: 2px 0; color: var(--muted); } .kv b { color: var(--text); font-weight: 500; }
.rl { display: flex; align-items: baseline; gap: 6px; width: 100%; text-align: left; background: none; border: 0; border-radius: var(--r-sm); padding: 3px 6px; margin: 0 -6px; }
.rl:hover { background: var(--p2); } .rl .r { color: var(--muted); font-size: 12px; white-space: nowrap; } .rl .ar { color: var(--accent); }
.rl.pending { color: var(--muted); font-style: italic; }
.card { background: var(--p2); border: 1px solid var(--line); border-radius: var(--r-md); padding: 10px 12px; margin-bottom: 10px; }
.card .d-add { color: var(--ok); } .card .d-del { color: var(--bad); } .card pre { margin: 6px 0 0; white-space: pre-wrap; font: 12px/1.5 var(--mono); }
.row { display: flex; gap: 8px; } .row input { flex: 1; min-width: 0; }
input, select { background: var(--void); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 5px 8px; }
pre.ctx { background: var(--void); border: 1px solid var(--line); border-radius: var(--r-md); padding: 10px; max-height: 280px; overflow: auto; white-space: pre-wrap; font: 11.5px/1.5 var(--mono); }
.ev { padding: 6px 0 6px 12px; border-left: 1px solid var(--faint); position: relative; }
.ev::before { content: ''; position: absolute; left: -3px; top: 13px; width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
.ev small { color: var(--muted); display: block; }

#web { position: relative; background: radial-gradient(ellipse at 50% 40%, #14151a 0%, var(--void) 70%); border-top: 1px solid var(--line); min-height: 0; }
#canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.web-bar { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 6px 12px; pointer-events: none; font-size: 12px; color: var(--muted); }
.web-bar > * { pointer-events: auto; }
.legend { display: flex; flex-wrap: wrap; gap: 4px 14px; } .web-actions { display: flex; gap: 6px; }
.web-actions button[aria-pressed=true] { border-color: var(--accent); }
body.immersive #web { position: fixed; inset: 44px 0 0 0; z-index: 20; border: 0; }

#palette { position: fixed; inset: 0; z-index: 50; background: rgba(5, 6, 8, .6); display: flex; justify-content: center; align-items: flex-start; padding-top: 12vh; }
#palette[hidden] { display: none; }
.pal-box { width: min(620px, 92vw); background: var(--p1); border: 1px solid var(--line); border-radius: var(--r-lg); box-shadow: 0 12px 40px rgba(0, 0, 0, .55); overflow: hidden; }
#pal-input { width: 100%; border: 0; border-bottom: 1px solid var(--line); border-radius: 0; padding: 12px 16px; font-size: 15px; background: var(--p1); }
#pal-list { list-style: none; margin: 0; padding: 4px; max-height: 50vh; overflow: auto; }
#pal-list li { padding: 7px 12px; border-radius: var(--r-sm); cursor: pointer; display: flex; flex-direction: column; }
#pal-list li small { color: var(--muted); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#pal-list li[aria-selected=true] { background: var(--p3); box-shadow: inset 2px 0 var(--accent); }
dialog { background: var(--p1); color: var(--text); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 18px 20px; width: min(380px, 92vw); }
dialog::backdrop { background: rgba(5, 6, 8, .6); } dialog h3 { margin: 0 0 12px; }
dialog label { display: block; margin-bottom: 10px; color: var(--muted); } dialog input, dialog select { display: block; width: 100%; margin-top: 4px; color: var(--text); }
.dlg-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
#hover { position: fixed; z-index: 60; width: 280px; background: var(--p1); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: 0 8px 28px rgba(0, 0, 0, .5); padding: 10px 12px; pointer-events: none; font-size: 12.5px; }
#hover b { font-size: 14px; } #hover p { margin: 4px 0; color: var(--muted); }
#mobile-nav { display: none; }

@media (max-width: 1024px) { #ws { grid-template-columns: 200px minmax(0, 1fr) 280px; } .top-actions kbd { display: none; } }
@media (max-width: 767px) {
  body { grid-template-rows: 44px minmax(0, 1fr) 46px; }
  #ws { display: block; position: relative; overflow: hidden; }
  #explorer, #editor, #context { position: absolute; inset: 0; display: none; border: 0; }
  #web { position: fixed; inset: 44px 0 46px 0; display: none; z-index: 5; }
  body[data-pane=explorer] #explorer, body[data-pane=editor] #editor, body[data-pane=context] #context { display: block; }
  body[data-pane=editor] #editor { display: flex; }
  body[data-pane=web] #web { display: block; }
  #mobile-nav { display: flex; background: var(--void); border-top: 1px solid var(--line); z-index: 30; }
  #mobile-nav button { flex: 1; border: 0; border-radius: 0; background: none; color: var(--muted); }
  body[data-pane=explorer] [data-pane=explorer], body[data-pane=web] [data-pane=web], body[data-pane=editor] [data-pane=editor], body[data-pane=context] [data-pane=context] { color: var(--text); box-shadow: inset 0 2px var(--accent); }
  .search { font-size: 0; } .search::before { content: 'Buscar'; font-size: 14px; } .search kbd, #palette-btn, #new-btn { display: none; } .brand { font-size: 13px; }
  #preview { padding: 16px; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
