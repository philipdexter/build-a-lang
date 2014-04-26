import sys
import simplejson as json

from bottle import route, run, request

def server():
    run(host='localhost', port='3456')

def translate(file='hello_world.py', lang_def=None):
    if lang_def is None:
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

    return python_code

@route('/translate')
@route('/translate/')
@route('/translate/<file>')
def server_translate(file='hello_world.py'):
    lang = None
    if request.query_string is not None and len(request.query_string) > 0:
        try:
            lang = json.loads(request.query_string)
        except:
            return 'bad language def'
    return translate(file, lang_def=lang)

if len(sys.argv) == 1:
    print("fail: requires at least one command line argument")
    exit(1)

if sys.argv[1] == 'translate':
    if len(sys.argv) > 2:
        print(translate(sys.argv[2]))
    else:
        print(translate())
    exit(0)

if sys.argv[1] == 'server':
    server()
    exit(0)

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
