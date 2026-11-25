#!/usr/bin/env python3
# Spacing / font-size grid check for theme/ (see CLAUDE.md → Design standards).
# Spacing: 0-12px in steps of 2, then multiples of 4. Font sizes: 10-20px even, then
# multiples of 4. Reports off-grid px values in theme.css.liquid and inline style="" attributes.
# Usage: tools/grid-check.py [--fix]      (exit code 1 when anything is off-grid)
import re, sys, glob, collections
SPACING = {'margin','margin-top','margin-right','margin-bottom','margin-left','margin-inline','margin-block','margin-inline-start','margin-inline-end','margin-block-start','margin-block-end',
 'padding','padding-top','padding-right','padding-bottom','padding-left','padding-inline','padding-block','padding-inline-start','padding-inline-end','padding-block-start','padding-block-end',
 'gap','row-gap','column-gap','top','right','bottom','left','inset','width','height','min-width','min-height','max-width','max-height','flex','flex-basis',
 'grid-template-columns','grid-template-rows','grid-auto-rows','grid-auto-columns','scroll-padding','scroll-margin','text-underline-offset'}
def snap_space(v):
    a=abs(v)
    if a<2: return v
    if a<=12: n=int(a/2+0.5)*2          # even, ties up
    else: n=int(a/4+0.5)*4              # multiple of 4, ties up
    return n if v>=0 else -n
def snap_font(v):
    if v<=20: n=max(10,int(v/2+0.5)*2) if v!=int(v) or v%2 else int(v)
    else: n=int(v/4+0.5)*4
    # fractional: nearest even (x.5 -> round half down to keep 12.5->12, 13.5->14, 10.5->10, 11.5->12)
    if v<=20 and v!=int(v):
        lo=int(v//2*2); hi=lo+2; n= lo if (v-lo)<(hi-v) or (v-lo==hi-v and lo%4==0) else hi
        n=max(10,n)
    return n
PX=re.compile(r'(-?\d*\.?\d+)px')
stats=collections.Counter()
def fix_value(prop, val):
    f = snap_font if prop=='font-size' else snap_space
    def r(m):
        v=float(m.group(1)); n=f(v)
        if n!=v: stats[(prop if prop=='font-size' else 'space', v, n)]+=1
        return (str(int(n)) if float(n).is_integer() else str(n))+'px'
    return PX.sub(r,val)
DECL=re.compile(r'(?<![\w-])([a-z-]+)(\s*:\s*)([^;{}"]*)')
def process_css(text):
    out=[]; i=0
    for m in DECL.finditer(text):
        prop=m.group(1)
        # preceding non-space char must be { or ; (a real declaration)
        j=m.start()-1
        while j>=0 and text[j] in ' \t\n\r': j-=1
        prev=text[j] if j>=0 else ''
        if prev not in '{;"': continue
        if prop not in SPACING and prop!='font-size': continue
        out.append((m.start(3),m.end(3),fix_value(prop,m.group(3))))
    for a,b,rep in reversed(out): text=text[:a]+rep+text[b:]
    return text
FIX='--fix' in sys.argv
import os
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','theme')
css=root+'/assets/theme.css.liquid'
t=open(css).read()
# skip @font-face blocks & media query conditions naturally (conditions aren't declarations after { or ;)
new=process_css(t)
if FIX: open(css,'w').write(new)
STYLE=re.compile(r'style="([^"]*)"')
for f in glob.glob(root+'/**/*.liquid',recursive=True):
    if f.endswith('theme.css.liquid'): continue
    t=open(f).read()
    n=STYLE.sub(lambda m:'style="'+process_css(m.group(1))+'"',t)
    if n!=t and FIX: open(f,'w').write(n)
for (kind,v,n),c in sorted(stats.items(), key=lambda x:(x[0][0],x[0][1])): print(f'{kind}: {v:g}px -> {n:g}px  ({c}x)')
if stats and not FIX: sys.exit(1)
print('grid ok' if not stats else 'fixed')
