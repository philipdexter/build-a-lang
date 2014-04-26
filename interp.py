import sys

mapping = [("=", "_EQOP", "IM_EQOP"),
           ("]", "_ARSCR", "IM_ARSCR"),
           ("[", "_ARSCL", "IM_ARSCL"),
           (")", "_PARR", "IM_PARR"),
           ("(", "_PARL", "IM_PARL")]

indentation = 0

inp = sys.stdin
buildup = ''
prompt_normal = ">- "
prompt_indent = "-- "

sys.__stdout__.write(prompt_normal)
sys.__stdout__.flush()

for line in inp:
    for r in mapping:
        line = line.replace(r[2], r[1])
    for r in mapping:
        line = line.replace(r[1], r[0])
    line = line.replace('\\n', '\n')

    line = line.rstrip()

    if line.endswith(':'):
        indentation += 1
        buildup += line + '\n'
        sys.__stdout__.write(prompt_indent)
        sys.__stdout__.flush()
        continue

    if line.startswith(' '):
        buildup += line + '\n'
        sys.__stdout__.write(prompt_indent)
        sys.__stdout__.flush()
        continue

    if indentation > 0:
        indentation = 0
        line = buildup
        buildup = ''

    try:
        r = eval(line)
        if r is not None:
            print(r)
    except:
        try:
            exec(line)
        except:
            print("Error be this -> " + str(line))
    sys.__stdout__.write(prompt_normal)
    sys.__stdout__.flush()