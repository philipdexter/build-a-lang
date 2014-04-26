import sys

indentation = 0

repl = [
    ('%', '_ARSCL', '['),
    ('$', '_ARSCR', ']'),
    ('#', '_EQOP', '='),
    ('<', '_PARL', '('),
    ('>', '_PARR', ')'),
]

sin = sys.argv[1]

for r in repl:
    sin = sin.replace(r[0], r[1])
for r in repl:
    sin = sin.replace(r[1], r[2])

sin = sin.replace('\\n', '\n')

for l in sin.splitlines():
    exec(l)
