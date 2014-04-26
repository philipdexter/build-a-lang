import sys
import simplejson as json

indentation = 0

lang_def = None
with open('language.json') as lang_def_file:
    lang_def = json.loads(lang_def_file.read())

if lang_def is None:
    print("error reading json language definition")
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
