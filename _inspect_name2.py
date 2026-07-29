# -*- coding: utf-8 -*-
path = r"d:\work\python_project\grok-auto-register\workers.js"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    c = f.read()

# Decode hex strings for readability of U map section
def decode_hex(s):
    import re
    s2 = re.sub(
        r"(?:'\\x[0-9a-fA-F]{2}'\s*\+\s*)+'\\x[0-9a-fA-F]{2}'",
        lambda m: repr("".join(chr(int(p, 16)) for p in re.findall(r"'\\x([0-9a-fA-F]{2})'", m.group(0)))),
        s,
    )
    s2 = re.sub(r"'\\x([0-9a-fA-F]{2})'", lambda m: repr(chr(int(m.group(1), 16))), s2)
    return s2

sections = {
    "U": (8694, 8694 + 4000),
    "lD_lM_lA": (29100, 32000),
    "lO_lX": (33000, 34500),
}

with open(r"d:\work\python_project\grok-auto-register\_out_name.txt", "w", encoding="utf-8") as o:
    for name, (a, b) in sections.items():
        o.write(f"\n\n===== {name} raw =====\n")
        o.write(c[a:b])
        o.write(f"\n\n===== {name} decoded =====\n")
        o.write(decode_hex(c[a:b]))

# Search for how proxy names are built: look for lA( usage context and clash name generation
import re
# find strings like name: with chinese
for pat in [r"function lD\(", r"function lM\(", r"function lA\(", r"const U=",
            r"regionCode", r"colo", r"isp", r"HKG", r"移动", r"电信", r"联通"]:
    print(pat, "count", len(re.findall(pat, c)))

# Find all references to U as object - maybe it's not U[
for m in re.finditer(r"\bU\b", c[:50000]):
    if m.start() > 8500:
        print("U at", m.start(), repr(c[m.start()-20:m.start()+40]))
        if m.start() > 10000:
            break

# Search for proxy name construction in clash yaml builder
# earlier decode found proxies around 78245 in decoded - check raw
print("\nsearch name construction patterns...")
for kw in ["lA(", "lD(", "lM(", "name:", "'name'", '"name"', "proxies", "proxy"]:
    # only first few after 70000
    s = 70000
    idxs = []
    while True:
        i = c.find(kw, s)
        if i < 0 or i > 90000:
            break
        idxs.append(i)
        s = i + 1
        if len(idxs) >= 5:
            break
    if idxs:
        print(kw, idxs)
        print("  ctx", repr(c[idxs[0]-30:idxs[0]+80]))
