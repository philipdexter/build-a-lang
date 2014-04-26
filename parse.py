import sys
import simplejson as json
import urllib.parse
import time
import re


from bottle import route, run, request, static_file, HTTPResponse

def init_spaces(s):
    count = 0
    for c in s:
        if c == ' ':
            count += 1
        else:
            break
    return count

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

mapping = {"==": "_MATHEQ",
           "!=": "_MATHIEQ",
           "<=": "_MATHLTEQ",
           ">=": "_MATHGTEQ",
           "<": "_MATHLT",
           ">": "_MATHGT",
           "+": "_MATHPL",
           "-": "_MATHMI",
           "=": "_EQOP",
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

    if lang_def['_SEMLAM'] != 'true':
        to_add = []
        python_lines = python_code.splitlines()
        out_lines = []
        lambda_count = 1
        for line in python_lines:
            inx = line.find('lambda')
            if inx != -1:
                p = re.compile(r'(.*)lambda([^:]*):([^:\),]+)')
                m = p.match(line)
                before = m.group(1)
                args = m.group(2)
                body = m.group(3)
                to_add.append("""def cvrtd_lambda_{}({}):
    return {}\n\n""".format(str(lambda_count), args, body))
                line = line.replace('lambda{}:{}'.format(args, body), 'cvrtd_lambda_{}'.format(str(lambda_count)))
                lambda_count += 1
            out_lines.append(line)
        i = 0
        for i, v in enumerate(out_lines):
            if len(v) > 0 and not v.startswith('import'):
                break
        python_code = '\n'.join(out_lines[:i]) + '\n' + '\n'.join(to_add) + '\n'.join(out_lines[i:])
    else:
        p = re.compile(r'\blambda\b')
        python_code = p.sub(lang_def['_SEMLAM_L'], python_code)

    if lang_def['_SEMDELIM'] == 'br':
        python_lines = python_code.splitlines()
        out_lines = []
        indentation = 0
        for line in python_lines:
            if line.endswith(':'):
                line = line[:-1] + ' {'
                indentation += 1
                out_lines.append(line)
                continue
            if init_spaces(line)//4 < indentation:
                indentation -= 1
                out_lines.append(('    ' * indentation) + '}')
            out_lines.append(line)
        while indentation > 0:
            indentation -= 1
            out_lines.append(('    ' * indentation) + '}')
        python_code = '\n'.join(out_lines)

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

    python_code = python_code.replace('_SEMDELIM', lang_def['_SEMDELIM'])

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
