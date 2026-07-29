# -*- coding: utf-8 -*-
import re
import sys

path = r"d:\work\python_project\grok-auto-register\workers.js"
out_path = r"d:\work\python_project\grok-auto-register\_inspect_name5_out.txt"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    c = f.read()

def decode_hex(s):
    s2 = re.sub(
        r"(?:'\\x[0-9a-fA-F]{2}'\s*\+\s*)+'\\x[0-9a-fA-F]{2}'",
        lambda m: repr("".join(chr(int(p, 16)) for p in re.findall(r"'\\x([0-9a-fA-F]{2})'", m.group(0)))),
        s,
    )
    s2 = re.sub(r"'\\x([0-9a-fA-F]{2})'", lambda m: repr(chr(int(m.group(1), 16))), s2)
    s2 = re.sub(
        r"'((?:\\x[0-9a-fA-F]{2})+)'",
        lambda m: repr("".join(chr(int(x, 16)) for x in re.findall(r"\\x([0-9a-fA-F]{2})", m.group(1)))),
        s2,
    )
    return s2

decoded = decode_hex(c)

lines = []
def log(*a):
    lines.append(" ".join(str(x) for x in a))

u_def = decoded.find("const U=")
log("U def", u_def)
log("decoded len", len(decoded), "raw len", len(c))

for pat in [r"\bU\[", r"\bU\.", r"in U\b", r"Object\.keys\(U\)"]:
    ms = list(re.finditer(pat, decoded))
    log(pat, len(ms), [m.start() for m in ms[:15]])
    for m in ms[:8]:
        snip = decoded[max(0, m.start()-50):m.start()+100].replace("\n", " ")
        log("  ", snip)

for kw in ["regionCode", "Hong Kong", "\u9999\u6e2f", "lq(", "lA(", "lZ(", "namer",
           "['isp']", "['colo']", "isp:", "colo:", "region:"]:
    idxs = []
    s = 0
    while True:
        i = decoded.find(kw, s)
        if i < 0:
            break
        idxs.append(i)
        s = i + 1
        if len(idxs) >= 20:
            break
    if idxs:
        log(f"\n{kw}: {idxs[:20]}")
        for i in idxs[:5]:
            snip = decoded[max(0, i-70):i+110].replace("\n", " ")
            log("  ", snip)

# Also search for proxy generation with name field near clash
# Look around first proxies: occurrence
p = decoded.find("proxies:")
log("\nfirst proxies:", p)
if p > 0:
    log(decoded[p-200:p+1500])

# Search function that builds proxy list objects
for kw in ["type: 'vless'", "type:'vless'", "type: \"vless\"", "'vless'", "vless://", "function lR", "function li"]:
    i = decoded.find(kw)
    log(kw, i)
    if i > 0:
        log("  ", decoded[max(0,i-100):i+200].replace("\n"," "))

with open(out_path, "w", encoding="utf-8") as o:
    o.write("\n".join(lines))
print("wrote", out_path, "lines", len(lines))
