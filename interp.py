#!/usr/bin/env python3

import sys

mapping = [("==", "_MATHEQ", "IM_MATHEQ"),
           ("<", "_MATHLT", "IM_MATHLT"),
           (">", "_MATHGT", "IM_MATHGT"),
           ("=", "_EQOP", "IM_EQOP"),
           ("]", "_ARSCR", "IM_ARSCR"),
           ("[", "_ARSCL", "IM_ARSCL"),
           (")", "_PARR", "IM_PARR"),
           ("(", "_PARL", "IM_PARL")]

sem = {"delim": "_SEMDELIM"}

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

    if sem['delim'] == 'ws' and line.endswith(':'):
        indentation += 1
        buildup += line + '\n'
        sys.__stdout__.write(prompt_indent)
        sys.__stdout__.flush()
        continue

    if sem['delim'] == 'br' and line.endswith('{') and not line.startswith('}'):
        buildup += (' ' * indentation) + line[:-1].lstrip() + ':' + '\n'
        indentation += 1
        sys.__stdout__.write(prompt_indent)
        sys.__stdout__.flush()
        continue

    if sem['delim'] == 'ws' and line.startswith(' '):
        buildup += line + '\n'
        sys.__stdout__.write(prompt_indent)
        sys.__stdout__.flush()
        continue

    if sem['delim'] == 'br' and indentation > 0:
        if line.startswith('}'):
            indentation -= 1
            if line.endswith('{'):
                offset = line.index('else') - line.index('}') - 1
                buildup += (' ' * indentation) + line[1+offset:-1] + ':' + '\n'
                indentation += 1
                sys.__stdout__.write(prompt_indent)
                sys.__stdout__.flush()
                continue
            if indentation > 0:
                sys.__stdout__.write(prompt_indent)
                sys.__stdout__.flush()
                continue
            else:
                line = ''
        else:
            buildup += (' ' * indentation) + line.lstrip() + '\n'
            sys.__stdout__.write(prompt_indent)
            sys.__stdout__.flush()
            continue

    if sem['delim'] == 'ws' and indentation > 0:
        indentation = 0
        line = buildup
        buildup = ''

    if sem['delim'] == 'br':
        buildup += line
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
