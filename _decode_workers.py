import re, sys

path = r"d:\work\python_project\grok-auto-register\workers.js"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

print("len", len(content))

# Decode '\xNN' concatenations roughly by replacing patterns
def decode_hex_strings(s):
    # replace '\x61'+'\x62' style and single '\x61'
    def repl_concat(m):
        parts = re.findall(r"'\\x([0-9a-fA-F]{2})'", m.group(0))
        return repr("".join(chr(int(p, 16)) for p in parts))
    s2 = re.sub(r"(?:'\\x[0-9a-fA-F]{2}'\s*\+\s*)+'\\x[0-9a-fA-F]{2}'", repl_concat, s)
    s2 = re.sub(r"'\\x([0-9a-fA-F]{2})'", lambda m: repr(chr(int(m.group(1), 16))), s2)
    return s2

# Also decode unicode escapes in object keys like '\x73\x75\x63\x63\x65\x73\x73'
def decode_inline_hex(s):
    return re.sub(r"'((?:\\x[0-9a-fA-F]{2})+)'", 
        lambda m: repr("".join(chr(int(x, 16)) for x in re.findall(r'\\x([0-9a-fA-F]{2})', m.group(1)))), s)

decoded = decode_hex_strings(content)
# Too big - search keywords in decoded
keywords = [
    "proxies", "proxy-groups", "clash", "yaml", "subscription",
    "country", "flag", "emoji", "节点", "国家", "香港", "美国", "日本",
    "新加坡", "台湾", "韩国", "德国", "英国", "加拿大", "澳大利亚",
    "name", "remark", "ps", "Host", "servername", "vless", "trojan",
    "socks", "ss://", "vmess", "base64", "FClash", "fclash",
    "getCountry", "countryCode", "iso", "CN", "HK", "US",
    "优选", "自定义", "订阅", "配置"
]
for kw in keywords:
    idxs = []
    start = 0
    while True:
        i = decoded.find(kw, start)
        if i < 0:
            break
        idxs.append(i)
        start = i + 1
        if len(idxs) >= 5:
            break
    if idxs:
        print(f"\n=== '{kw}' count~ positions: {idxs[:5]} ===")
        for i in idxs[:3]:
            snip = decoded[max(0,i-80):i+120].replace("\n"," ")
            print(f"  @{i}: ...{snip}...")

# Look for country code maps - often objects like {HK: '香港', US: '美国'}
# Search for common Chinese country names as unicode in original
for ch in ["香港", "美国", "日本", "新加坡", "台湾", "韩国", "德国", "英国", "节点", "优选", "订阅"]:
    # as unicode escape
    esc = "".join(f"\\u{ord(c):04x}" for c in ch)
    if ch in content or esc in content:
        print(f"found chinese '{ch}' or escape")
    # also as hex concatenated chinese - chinese is multi-byte so usually \u
    # Chinese in this file often appears as '\uXXXX' in the earlier output as actual unicode chars in string concat via \u in source
    # Looking at earlier: '\u529f'+'\u80fd' style
    parts = "+".join(f"'\\u{ord(c):04x}'" for c in ch)
    # actual file may use '\uXXXX' without double escape
    # search for first char unicode
    c0 = f"'\\u{ord(ch[0]):04x}'"
    if c0 in content or ch[0] in content:
        pass

# Find all unique Chinese snippets by decoding \uXXXX concatenations
# Pattern: '\uXXXX'+'\uYYYY'...
u_pattern = re.compile(r"(?:'\\u[0-9a-fA-F]{4}'\s*\+\s*)+'\\u[0-9a-fA-F]{4}'")
found = set()
for m in u_pattern.finditer(content):
    parts = re.findall(r"'\\u([0-9a-fA-F]{4})'", m.group(0))
    s = "".join(chr(int(p, 16)) for p in parts)
    if any("\u4e00" <= c <= "\u9fff" for c in s):
        found.add(s)
print("\n=== Chinese strings from \\u concat (sample) ===")
for s in sorted(found)[:80]:
    print(repr(s))
print(f"total chinese strings: {len(found)}")
