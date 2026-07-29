import re

path = r"d:\work\python_project\grok-auto-register\workers.js"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

def decode_hex_strings(s):
    def repl_concat(m):
        parts = re.findall(r"'\\x([0-9a-fA-F]{2})'", m.group(0))
        return '"' + "".join(chr(int(p, 16)) for p in parts) + '"'
    s2 = re.sub(r"(?:'\\x[0-9a-fA-F]{2}'\s*\+\s*)+'\\x[0-9a-fA-F]{2}'", repl_concat, s)
    def repl_u(m):
        parts = re.findall(r"'\\u([0-9a-fA-F]{4})'", m.group(0))
        return '"' + "".join(chr(int(p, 16)) for p in parts) + '"'
    s2 = re.sub(r"(?:'\\u[0-9a-fA-F]{4}'\s*\+\s*)+'\\u[0-9a-fA-F]{4}'", repl_u, s2)
    s2 = re.sub(r"'\\x([0-9a-fA-F]{2})'", lambda m: '"' + chr(int(m.group(1), 16)) + '"', s2)
    return s2

decoded = decode_hex_strings(content)

# Find all usages of U[
print("=== U[ usages ===")
for m in re.finditer(r"\bU\[", decoded):
    print(decoded[m.start()-50:m.start()+150].replace("\n"," ")[:200])
    print("---")

# Find regionCode / region usage for naming
print("\n=== region / regionCode usages ===")
for kw in ["regionCode", "region", "colo", "country"]:
    count = 0
    for m in re.finditer(re.escape(kw), decoded):
        if count < 8:
            snip = decoded[max(0,m.start()-60):m.start()+120].replace("\n"," ")
            # skip HTML CSS noise
            if "background" in snip or "color:" in snip or "margin" in snip:
                continue
            print(f"{kw}@{m.start()}: {snip[:180]}")
            print("---")
            count += 1

# Find how node objects are built - look for name: assignment when building proxies
print("\n=== building proxy name ===")
for m in re.finditer(r'\["name"\]\s*=', decoded):
    snip = decoded[max(0,m.start()-80):m.start()+100].replace("\n"," ")
    if "function" not in snip[:30]:
        print(f"@{m.start()}: {snip[:200]}")
        print("---")

# lA usage
print("\n=== lA( / lq( usages ===")
for m in re.finditer(r"\blA\(|\blq\(", decoded):
    print(decoded[m.start()-30:m.start()+100].replace("\n"," ")[:140])
    print("---")

# function that maps region to name - search U usage and flag
print("\n=== Look for flag emoji generation / Y function string table ===")
# Y is the decoder: function Y / const uT=Y
i = decoded.find("function Y(")
print("function Y at", i)
if i < 0:
    # maybe function l(
    for pat in ["function Y(", "function l(", "const l=", "function l "]:
        print(pat, decoded.find(pat))

# Find string array used by Y
# typical: function l(){const y8=[...];l=function(){return y8;};return l();}
i = content.find("function l(")
print("function l in raw", i)
# search for hong kong flag related in string array - base64 or raw
# uT(0x142) for HK flag
# Look at string table around flags

# Decode V() base64 strings that might be relevant
print("\n=== V() base64 decodes sample related ===")
for m in re.finditer(r"V\('([^']+)'\)|V\(\"([^\"]+)\"\)", content):
    b64 = m.group(1) or m.group(2)
    try:
        import base64
        dec = base64.b64decode(b64).decode('utf-8', errors='replace')
        if any(k in dec.lower() for k in ['name','country','flag','clash','proxy','region','hk','us']):
            print(b64, '->', dec)
    except Exception:
        pass
