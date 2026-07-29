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
    # also single-quoted multi hex like '\x48\x4b'
    s2 = re.sub(
        r"'((?:\\x[0-9a-fA-F]{2})+)'",
        lambda m: repr("".join(chr(int(x, 16)) for x in re.findall(r"\\x([0-9a-fA-F]{2})", m.group(1)))),
        s2,
    )
    return s2

# Extract naming functions fully
for name, pos in [("lD", 29148), ("lM", 30293), ("lA", 31299), ("lO", 33085), ("lX", 33131)]:
    # find end of function roughly - next function or 2000 chars
    chunk = c[pos:pos+2500]
    print(f"\n===== {name} @{pos} =====")
    print(decode_hex(chunk[:2000]))
    print("...")

# Find how proxy names are assigned - search decoded content
decoded = decode_hex(c)
# Write key sections
with open(r"d:\work\python_project\grok-auto-register\_out_name2.txt", "w", encoding="utf-8") as o:
    o.write("=== U map ===\n")
    i = decoded.find("const U=")
    o.write(decoded[i:i+3500])
    o.write("\n\n=== lD ===\n")
    o.write(decoded[decoded.find("function lD"):decoded.find("function lD")+1500])
    o.write("\n\n=== lM ===\n")
    o.write(decoded[decoded.find("function lM"):decoded.find("function lM")+1200])
    o.write("\n\n=== lA ===\n")
    o.write(decoded[decoded.find("function lA"):decoded.find("function lA")+2000])
    o.write("\n\n=== lX ===\n")
    o.write(decoded[decoded.find("function lX"):decoded.find("function lX")+1500])

# Search name building
print("\n=== search name patterns in decoded ===")
for kw in ["name:", "proxies:", ".name", "['name']", "region", "colo", "isp", "U[", "U."]:
    idxs = []
    s = 0
    while True:
        i = decoded.find(kw, s)
        if i < 0:
            break
        idxs.append(i)
        s = i + 1
        if len(idxs) >= 15:
            break
    print(kw, "count~", len(idxs), "first", idxs[:8])

# Find proxy object construction - typically {name: ..., type: vless
for m in re.finditer(r"name['\"]?\s*[:=]", decoded):
    if 50000 < m.start() < 200000:
        snip = decoded[m.start()-50:m.start()+100].replace("\n", " ")
        print(f"name@ {m.start()}: {snip}")
        if m.start() > 150000:
            break
