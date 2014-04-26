import sys
import simplejson as json

def translate(file='hello_world.py'):
    lang_def = None
    with open('language.json') as lang_def_file:
        lang_def = json.loads(lang_def_file.read())
    if lang_def is None:
        print('error reading json language definition')
        exit(1)
    python_code = None
    with open(file) as python_file:
        python_code = python_file.read()
    if python_code is None:
        print('error reading python file', file)
        exit(1)

    repl = lang_def['rules']

    for r in repl:
        python_code = python_code.replace(r['python_rep'], r['il_rep'])
    for r in repl:
        python_code = python_code.replace(r['il_rep'], r['lang_rep'])

    python_code = python_code.replace('\\n', '\n')

    print(python_code)

    exit(0)

if len(sys.argv) == 1:
    print("fail: requires at least one command line argument")
    exit(1)

if sys.argv[1] == 'translate':
    if len(sys.argv) > 2:
        translate(sys.argv[2])
    else:
        translate()

print('fail: shouldn\'t reach here')
exit(1)

indentation = 0

lang_def = None
with open('language.json') as lang_def_file:
    lang_def = json.loads(lang_def_file.read())

if lang_def is None:
    print('error reading json language definition')
    exit(1)

repl = lang_def['rules']

sin = sys.argv[1]

for r in repl:
    sin = sin.replace(r['lang_rep'], r['il_rep'])
for r in repl:
    sin = sin.replace(r['il_rep'], r['python_rep'])

sin = sin.replace('\\n', '\n')

for l in sin.splitlines():
    try:
        r = eval(l)
        if r is not None:
            print(r)
    except:
        try:
            exec(l)
        except:
            print("ERROR OMG ERROR" + str(l))
