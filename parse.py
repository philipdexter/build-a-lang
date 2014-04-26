import sys
import simplejson as json
import urllib.parse
import time

from bottle import route, run, request, static_file, HTTPResponse

def my_static_file(text, mimetype=None, download=False, charset='UTF-8'):
    headers = dict()

    if mimetype:
        if mimetype[:5] == 'text/' and charset and 'charset' not in mimetype:
            mimetype += '; charset=%s' % charset
        headers['Content-Type'] = mimetype

    headers['Content-Disposition'] = 'attachment; filename="%s"' % download

    headers['Content-Length'] = clen = len(text)
    lm = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(time.time()))
    headers['Last-Modified'] = lm

    body = '' if request.method == 'HEAD' else text

    headers["Accept-Ranges"] = "bytes"
    ranges = request.environ.get('HTTP_RANGE')
    if 'HTTP_RANGE' in request.environ:
        ranges = list(parse_range_header(request.environ['HTTP_RANGE'], clen))
        if not ranges:
            return HTTPError(416, "Requested Range Not Satisfiable")
        offset, end = ranges[0]
        headers["Content-Range"] = "bytes %d-%d/%d" % (offset, end-1, clen)
        headers["Content-Length"] = str(end-offset)
        if body: body = _file_iter_range(body, offset, end-offset)
        return HTTPResponse(body, status=206, **headers)
    return HTTPResponse(body, **headers)

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

    for r in repl:
        python_code = python_code.replace('IM'+mapping[r[0]], r[1])

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
    interp = interpreter(lang_def=lang)
    download_name = lang['l_name'] + '.py'
    return my_static_file(interp, mimetype="text/utf-8", download=download_name)

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
