# -*- coding: utf-8 -*-
"""Inspect and patch node naming in workers.js for Chinese country display."""
import re

path = r"d:\work\python_project\grok-auto-register\workers.js"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    c = f.read()

# Extract exact lq function
start = c.find("function lq(")
end = c.find("function lA(", start)
print("lq range", start, end)
print(repr(c[start:end]))

# Extract U map start to understand flag helpers
u_start = c.find("const U=")
print("\nU map first 800:")
print(c[u_start:u_start+800])

# Check if there's already any colo country helper
for kw in ["function lq", "colo", "HKG", "regionCode"]:
    print(kw, c.find(kw))
