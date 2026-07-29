# -*- coding: utf-8 -*-
path = r"d:\work\python_project\grok-auto-register\workers.js"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    c = f.read()

start = c.find("const U={")
print("U map start", start)
with open(r"d:\work\python_project\grok-auto-register\_out_u.txt", "w", encoding="utf-8") as o:
    o.write(c[start:start + 3000])
    o.write("\n\n=== NAMING ===\n")
    o.write(c[16400:18000])
    o.write("\n\n=== country cf ===\n")
    o.write(c[18150:19000])

print("written _out_u.txt")

# find keyword positions
for kw in ["function lD", "function lM", "function lA", "function lO", "function lX",
           "regionCode", "colo", "proxies:", "name: \"", "lA(", "U[", "U['"]:
    idxs = []
    s = 0
    while True:
        i = c.find(kw, s)
        if i < 0:
            break
        idxs.append(i)
        s = i + 1
        if len(idxs) >= 10:
            break
    print(kw, idxs)
