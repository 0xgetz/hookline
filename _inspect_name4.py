# -*- coding: utf-8 -*-
import re
path = r"d:\work\python_project\grok-auto-register\workers.js"
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

# Find all uses of U after definition
u_def = decoded.find("const U=")
print("U def", u_def)
# search for patterns that access country map
for pat in [r"\bU\[", r"\bU\.", r"in U\b", r"U\s*&&", r"Object\.keys\(U\)", r"U\['", r'U\["']:
    ms = list(re.finditer(pat, decoded))
    print(pat, len(ms), [m.start() for m in ms[:10]])
    for m in ms[:5]:
        print(" ", decoded[m.start()-40:m.start()+80].replace("\n"," "))

# Search for region name display
for kw in ["regionCode", "region", "Hong Kong", "香港", "U[y", "U[y8", "U[y9", "U[yl", "U[yy",
           "lq(", "lA(", "lZ(", "namer", "proxy name", "ps=", "#", "remarks"]:
    idxs = []
    s = 0
    while True:
        i = decoded.find(kw, s)
        if i < 0: break
        idxs.append(i)
        s = i + 1
        if len(idxs) >= 12: break
    if idxs:
        print(f"\n{kw}: {idxs[:12]}")
        for i in idxs[:3]:
            print(" ", repr(decoded[max(0,i-60):i+100]))

# Find where isp and colo are assigned to node objects
for kw in ["['isp']", "['colo']", '"isp"', "'isp'", "'colo'", "isp:", "colo:"]:
    idxs = []
    s = 0
    while True:
        i = decoded.find(kw, s)
        if i < 0: break
        idxs.append(i)
        s = i + 1
        if len(idxs) >= 15: break
    if idxs:
        print(f"\n{kw}: {idxs[:15]}")
        for i in idxs[:4]:
            print(" ", repr(decoded[max(0,i-80):i+120]))
