# -*- coding: utf-8 -*-
import re

path = r"d:\work\python_project\grok-auto-register\workers.js"
out_path = r"d:\work\python_project\grok-auto-register\_inspect_name6_out.txt"

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

# Find function la
for m in re.finditer(r"function la\(", decoded):
    log("function la at", m.start())
    log(decoded[m.start():m.start()+2000])

# Find function ld (clash proxy yaml)
for m in re.finditer(r"function ld\(", decoded):
    log("\nfunction ld at", m.start())
    log(decoded[m.start():m.start()+1500])

# Search colo airport code maps - HKG, NRT, LAX etc
for kw in ["HKG", "NRT", "LAX", "SJC", "airport", "iata", "data center", "机房", "coloMap", "coloTo", "cityMap"]:
    i = decoded.find(kw)
    log(kw, i)
    if i >= 0:
        log(" ", decoded[max(0,i-80):i+150].replace("\n"," "))

# Find where isp/colo assigned when building node list
for m in re.finditer(r"isp\s*[:=]", decoded):
    if m.start() < 200000:
        snip = decoded[max(0,m.start()-100):m.start()+150].replace("\n"," ")
        log(f"\nisp@ {m.start()}: {snip}")

# Search for assignment of colo field
for m in re.finditer(r"\['colo'\]\s*=", decoded):
    snip = decoded[max(0,m.start()-80):m.start()+120].replace("\n"," ")
    log(f"colo assign@ {m.start()}: {snip}")

for m in re.finditer(r"colo['\"]?\s*:", decoded):
    if m.start() < 150000:
        snip = decoded[max(0,m.start()-80):m.start()+120].replace("\n"," ")
        log(f"colo:@ {m.start()}: {snip}")

# Find yk=yu||lA context - how name is set on proxy
for pos in [105512, 108733, 110018]:
    log(f"\n=== context around lA usage {pos} ===")
    log(decoded[pos-300:pos+800])

# Look for 'name' assignment near proxy building
for m in re.finditer(r"\['name'\]\s*=", decoded):
    if m.start() < 200000:
        snip = decoded[max(0,m.start()-100):m.start()+150].replace("\n"," ")
        log(f"name=@{m.start()}: {snip}")

with open(out_path, "w", encoding="utf-8") as o:
    o.write("\n".join(lines))
print("wrote", out_path, "lines", len(lines))
