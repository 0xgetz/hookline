import re

path = r"d:\work\python_project\grok-auto-register\workers.js"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

def decode_hex_strings(s):
    def repl_concat(m):
        parts = re.findall(r"'\\x([0-9a-fA-F]{2})'", m.group(0))
        return '"' + "".join(chr(int(p, 16)) for p in parts) + '"'
    s2 = re.sub(r"(?:'\\x[0-9a-fA-F]{2}'\s*\+\s*)+'\\x[0-9a-fA-F]{2}'", repl_concat, s)
    # decode unicode concat
    def repl_u(m):
        parts = re.findall(r"'\\u([0-9a-fA-F]{4})'", m.group(0))
        return '"' + "".join(chr(int(p, 16)) for p in parts) + '"'
    s2 = re.sub(r"(?:'\\u[0-9a-fA-F]{4}'\s*\+\s*)+'\\u[0-9a-fA-F]{4}'", repl_u, s2)
    # single hex
    s2 = re.sub(r"'\\x([0-9a-fA-F]{2})'", lambda m: '"' + chr(int(m.group(1), 16)) + '"', s2)
    return s2

decoded = decode_hex_strings(content)

# Extract the country map U around position 4473
print("=== Country map U region ===")
print(decoded[4300:6500])

print("\n\n=== Node name generation around lM / country ===")
# find lM function and related
for kw in ["function lM", "function lx", "function lp", "function ld", "function lB", "function lR", "function lq", "const U="]:
    i = decoded.find(kw)
    print(f"\n--- {kw} at {i} ---")
    if i>=0:
        print(decoded[i:i+800])

print("\n\n=== clash generation around proxies: ===")
i = decoded.find("const yV=['proxies:']")
print(decoded[i-1500:i+2000] if i>=0 else "not found")

print("\n\n=== name assignment for nodes ===")
# search for patterns like name: or .name =
for m in re.finditer(r"name['\"]?\s*[:=]", decoded):
    if 70000 < m.start() < 90000:
        print(decoded[m.start()-100:m.start()+200].replace('\n',' ')[:250])
        print('---')
