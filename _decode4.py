import re, base64

path = r"d:\work\python_project\grok-auto-register\workers.js"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

def decode_all(s):
    def repl_concat(m):
        parts = re.findall(r"'\\x([0-9a-fA-F]{2})'", m.group(0))
        return '"' + "".join(chr(int(p, 16)) for p in parts) + '"'
    s2 = re.sub(r"(?:'\\x[0-9a-fA-F]{2}'\s*\+\s*)+'\\x[0-9a-fA-F]{2}'", repl_concat, s)
    def repl_u(m):
        parts = re.findall(r"'\\u([0-9a-fA-F]{4})'", m.group(0))
        return '"' + "".join(chr(int(p, 16)) for p in parts) + '"'
    s2 = re.sub(r"(?:'\\u[0-9a-fA-F]{4}'\s*\+\s*)+'\\u[0-9a-fA-F]{4}'", repl_u, s2)
    s2 = re.sub(r"'\\x([0-9a-fA-F]{2})'", lambda m: '"' + chr(int(m.group(1), 16)) + '"', s2)
    # decode \xNN inside strings like '\x48\x4b'
    s2 = re.sub(r"'((?:\\x[0-9a-fA-F]{2})+)'", 
        lambda m: '"' + "".join(chr(int(x,16)) for x in re.findall(r'\\x([0-9a-fA-F]{2})', m.group(1))) + '"', s2)
    return s2

decoded = decode_all(content)

# Extract full string table for Y decoder
# Find function Y
i = decoded.find("function Y(")
print("=== function Y ===")
print(decoded[i:i+600])

# Find string array - typically at end or after function l
# Search for emoji flags in decoded content
print("\n=== flag emoji occurrences ===")
# regional indicator symbols
for m in re.finditer(r"[\U0001F1E6-\U0001F1FF]{2}", decoded):
    print(repr(m.group()), "at", m.start(), decoded[max(0,m.start()-40):m.start()+80].replace("\n"," ")[:120])

# Also \ud83c\udde8 style
print("\n=== escaped flag patterns ===")
for m in re.finditer(r"\\ud83c\\ud[de][0-9a-f]{2}", decoded, re.I):
    print(m.group(), "at", m.start())
    if m.start() > 0:
        break

# Find how U map is used - maybe U[xx][0]
print("\n=== Search U map access patterns ===")
for pat in [r"U\[", r"\bU\.", r"Object\[.keys.\]\(U\)", r"in U", r"U\b"]:
    pass

# Search for regionNames
print("\n=== regionNames ===")
i = decoded.find("regionNames")
print(decoded[i-200:i+800] if i>=0 else "not found")

# How preferred IP nodes get names - look near y2 and preferred IPs
print("\n=== around preferred IP name generation ===")
# Search for isp assignment
for m in re.finditer(r'\["isp"\]', decoded):
    print(decoded[m.start()-80:m.start()+120].replace("\n"," ")[:200])
    print("---")

# Search for how node object is created with name field
print("\n=== name: in object literals near proxy gen ===")
# function that generates nodes - look at la function
for kw in ["function la", "function lS", "function lC", "function lo", "function le", "function lu", "function lK"]:
    i = decoded.find(kw)
    print(f"{kw} at {i}")
    if i>=0:
        print(decoded[i:i+500])
        print("====")
