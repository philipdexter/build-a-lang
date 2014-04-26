import sys
import simplejson as json
import urllib.parse

from bottle import route, run, request

mapping = {"=": "_EQOP",
           "]": "_ARSCR",
           "[": "_ARSCL",
           ")": "_PARR",
           "(": "_PARL"}

def server():
    run(host='localhost', port='3456')

def translate(file='hello_world.py', lang_def=None):
    python_code = None
    with open(file) as python_file:
        python_code = python_file.read()
    if python_code is None:
        return 'error reading python file ' + str(file)

    repl = lang_def['rules']

    for r in repl:
        python_code = python_code.replace(r[0], mapping[r[0]])
    for r in repl:
        python_code = python_code.replace(mapping[r[0]], r[1])

    python_code = python_code.replace('\\n', '\n')

    return python_code

def interpreter(lang_def=None):
    python_code = None
    with open('interp.py') as python_file:
        python_code = python_file.read()
    if python_code is None:
        return 'error reading interp.py'

    repl = lang_def['rules']

    return python_code

@route('/translate')
@route('/translate/')
@route('/translate/<file>')
def server_translate(file='hello_world.py'):
    lang = None
    if request.query_string is not None and len(request.query_string) > 0:
        try:
            lang = json.loads(urllib.parse.unquote(request.query_string))
        except:
            return 'bad language def'
    return translate(file, lang_def=lang)

@route('/interpreter')
@route('/interpreter/')
def server_interpreter():
    lang = None
    if request.query_string is not None and len(request.query_string) > 0:
        try:
            lang = json.loads(urllib.parse.unquote(request.query_string))
        except:
            return 'bad language def'
    return interpreter(lang_def=lang)

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
