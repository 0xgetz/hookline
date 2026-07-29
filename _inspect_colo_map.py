# -*- coding: utf-8 -*-
import re

path = r"d:\work\python_project\grok-auto-register\workers.js"
out_path = r"d:\work\python_project\grok-auto-register\_inspect_colo_map_out.txt"

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

# Find 机房映射 section
idx = decoded.find("机房映射")
if idx < 0:
    # try unicode concat form
    idx = decoded.find("'\u673a'+'\u623f'+'\u6620'+'\u5c04'")
print("机房映射 idx", idx)

# also search for 'SJC': pattern
idx2 = decoded.find("'SJC':")
print("SJC idx", idx2)

lines = []
if idx2 > 0:
    # extract large chunk of colo map
    chunk = decoded[idx2-200:idx2+8000]
    lines.append(chunk)

# raw positions for lq function - find in raw file
# function lq - find by unique string from decoded
# In raw: function lq is after lM
raw_lm = c.find("function lM")
print("raw lM", raw_lm)
# find function lq after that - may be obfuscated differently
# search for unique pattern: IPv6优选 or similar unicode
for pat in ["IPv6", "IPv4", "自定义优选", "function lq", "function lA"]:
    print(pat, c.find(pat), decoded.find(pat))

# Find exact raw snippet of lq by matching surrounding unique ascii
marker = "function lA(y8=![])"
print("lA marker raw", c.find(marker), "decoded", decoded.find(marker))

# Get raw index of lq via unique sequence after decoding mapping
# Search for: return yY?yl+'-'+yY:yl
marker2 = "return yY?yl+'-'+yY:yl"
print("marker2 raw", c.find(marker2), "decoded", decoded.find(marker2))

# Find in raw with unicode escapes
marker3 = "return yY?yl+'-'+yY:yl"
# The chinese parts are unicode escaped so ascii parts should match
idx_m = c.find("yl+'-'+yY:yl")
print("yl+'-'+yY:yl at", idx_m)
if idx_m > 0:
    lines.append("\n\n=== raw naming functions ===\n")
    lines.append(c[idx_m-800:idx_m+200])

# Extract full colo map keys from frontend
# pattern 'XXX': 'emoji chinese'
colo_section = decoded[idx2:idx2+15000] if idx2 > 0 else ""
# Find end of map
end = colo_section.find("};")
lines.append("\n\n=== colo map keys sample ===\n")
lines.append(colo_section[:end+10] if end > 0 else colo_section[:5000])

# Also find if there's country code from colo elsewhere
# Search for HKG in raw
print("HKG raw", c.find("HKG"), "decoded", decoded.find("HKG"))

with open(out_path, "w", encoding="utf-8") as o:
    o.write("\n".join(lines))
print("wrote", out_path)
