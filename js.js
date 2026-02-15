var selected_file = "hello_world.py";

var EXAMPLE_FILES = {
    "hello_world.py": "greeting = \"Hello, World!\"\n\nprint(greeting)\n",
    "fib.py": "def fib(n):\n    a = 0\n    b = 1\n    i = 1\n    while i < n:\n        a, b = a + b, a\n        i += 1\n    return a\n\nfor i in range(0, 10):\n    print(fib(i))\n",
    "functional.py": "import itertools\nimport functools\nimport operator\n\nnumbers = itertools.islice(itertools.count(), 10)\nsummation = functools.reduce(operator.add, numbers, 0)\nsummation2 = functools.reduce(lambda a, x: a + x, numbers, 0)\nproduct = functools.reduce(lambda a, x: a * x, numbers, 1)\n\nprint(summation)\n",
    "class.py": "class Code:\n    def just(self):\n        print('just code stuff')\n\n    def maybe(self):\n        print('maybe code stuff')\n",
    "math_.py": "n = 2\n\nif n == 2:\n    print('n was 2')\n\nm = 3\n\nif n <3:\n    print('less than three')\n\ni = 0\nwhile i < 10:\n    i += 1\nprint(m + 12)\n\nif 2 <= 3:\n    i = 10\n    if i >= 10:\n        print('factual')\n\nprint(5 != 6)\n"
};

var INTERPRETER_TEMPLATE = "#!/usr/bin/env python3\n\nimport sys\n\nmapping = [(\"==\", \"_MATHEQ\", \"IM_MATHEQ\"),\n           (\"!=\", \"_MATHIEQ\", \"IM_MATHIEQ\"),\n           (\"<=\", \"_MATHLTEQ\", \"IM_MATHLTEQ\"),\n           (\">=\", \"_MATHGEQT\", \"IM_MATHGTEQ\"),\n           (\"<\", \"_MATHLT\", \"IM_MATHLT\"),\n           (\">\", \"_MATHGT\", \"IM_MATHGT\"),\n           (\"+\", \"_MATHPL\", \"IM_MATHPL\"),\n           (\"-\", \"_MATHMI\", \"IM_MATHMI\"),\n           (\"=\", \"_EQOP\", \"IM_EQOP\"),\n           (\"]\", \"_ARSCR\", \"IM_ARSCR\"),\n           (\"[\", \"_ARSCL\", \"IM_ARSCL\"),\n           (\")\", \"_PARR\", \"IM_PARR\"),\n           (\"(\", \"_PARL\", \"IM_PARL\")]\n\nsem = {\"delim\": \"_SEMDELIM\"}\n\nindentation = 0\n\ninp = sys.stdin\nbuildup = ''\nprompt_normal = \">- \"\nprompt_indent = \"-- \"\n\nsys.__stdout__.write(prompt_normal)\nsys.__stdout__.flush()\n\nfor line in inp:\n    for r in mapping:\n        line = line.replace(r[2], r[1])\n    for r in mapping:\n        line = line.replace(r[1], r[0])\n    line = line.replace('\\\\n', '\\n')\n\n    line = line.rstrip()\n\n    if sem['delim'] == 'ws' and line.endswith(':'):\n        indentation += 1\n        buildup += line + '\\n'\n        sys.__stdout__.write(prompt_indent)\n        sys.__stdout__.flush()\n        continue\n\n    if sem['delim'] == 'br' and line.endswith('{') and not line.startswith('}'):\n        buildup += (' ' * indentation) + line[:-1].lstrip() + ':' + '\\n'\n        indentation += 1\n        sys.__stdout__.write(prompt_indent)\n        sys.__stdout__.flush()\n        continue\n\n    if sem['delim'] == 'ws' and line.startswith(' '):\n        buildup += line + '\\n'\n        sys.__stdout__.write(prompt_indent)\n        sys.__stdout__.flush()\n        continue\n\n    if sem['delim'] == 'br' and indentation > 0:\n        if line.startswith('}'):\n            indentation -= 1\n            if line.endswith('{'):\n                offset = line.index('else') - line.index('}') - 1\n                buildup += (' ' * indentation) + line[1+offset:-1] + ':' + '\\n'\n                indentation += 1\n                sys.__stdout__.write(prompt_indent)\n                sys.__stdout__.flush()\n                continue\n            if indentation > 0:\n                sys.__stdout__.write(prompt_indent)\n                sys.__stdout__.flush()\n                continue\n            else:\n                line = ''\n        else:\n            buildup += (' ' * indentation) + line.lstrip() + '\\n'\n            sys.__stdout__.write(prompt_indent)\n            sys.__stdout__.flush()\n            continue\n\n    if sem['delim'] == 'ws' and indentation > 0:\n        indentation = 0\n        line = buildup\n        buildup = ''\n\n    if sem['delim'] == 'br':\n        buildup += line\n        indentation = 0\n        line = buildup\n        buildup = ''\n\n    try:\n        r = eval(line)\n        if r is not None:\n            print(r)\n    except:\n        try:\n            exec(line)\n        except:\n            print(\"Error be this -> \" + str(line))\n    sys.__stdout__.write(prompt_normal)\n    sys.__stdout__.flush()\n";

var TOKEN_IDS = {
    "==": "_MATHEQ",
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
    "(": "_PARL"
};

var TOKENS = ["]", "[", "(", ")", "==", "!=", "<=", ">=", "<", ">", "+", "-", "="];

function setup_switch(li, file) {
    $(li).click(function() {
        $(".pure-menu-selected").removeClass("pure-menu-selected");
        $(li).addClass("pure-menu-selected");
        selected_file = file;
        refresh_code();
    });
}

function setup_switch_radio(li) {
    $(li).click(function() {
        $(".pure-menu-selected").removeClass("pure-menu-selected");
        refresh_code();
    });
}

function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function replace_it(data) {
    var ndiv = document.createElement('div');
    ndiv.innerHTML = '<pre style="width: 60%; margin-left: auto; margin-right: auto; border: 3px solid #1f8dd6; border-radius: 15px;"><code id="thacode" data-language="python">' + htmlEscape(data) + '</code></pre>';
    Rainbow.color(ndiv, function() {
        var p = document.getElementById('thacode').parentNode;
        p.parentNode.replaceChild(ndiv, p);
    });
}

function str_replace_all(haystack, needle, replacement) {
    return haystack.split(needle).join(replacement);
}

function count_leading_spaces(s) {
    var count = 0;
    for (var i = 0; i < s.length; i++) {
        if (s.charAt(i) === ' ') {
            count += 1;
        } else {
            break;
        }
    }
    return count;
}

function apply_lambda_rules(code, lang) {
    if (lang._SEMLAM === 'true') {
        return code.replace(/\blambda\b/g, lang._SEMLAM_L);
    }

    var lines = code.split('\n');
    var out = [];
    var lifted = [];
    var lambda_count = 1;
    var pattern = /(.*)lambda([^:]*):([^:\),]+)/;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var m = line.match(pattern);
        if (m) {
            var args = m[2];
            var body = m[3];
            var arg_list = args.length > 0 ? args.slice(1) : '';
            lifted.push('def cvrtd_lambda_' + lambda_count + '(' + arg_list + '):\n    return ' + body + '\n');
            line = line.replace('lambda' + args + ':' + body, 'cvrtd_lambda_' + lambda_count);
            lambda_count += 1;
        }
        out.push(line);
    }

    if (lifted.length === 0) {
        return out.join('\n');
    }

    var insert_idx = 0;
    for (var j = 0; j < out.length; j++) {
        if (out[j].length > 0 && out[j].indexOf('import') !== 0) {
            insert_idx = j;
            break;
        }
    }

    return out.slice(0, insert_idx).join('\n') + '\n' + lifted.join('\n') + '\n' + out.slice(insert_idx).join('\n');
}

function apply_brace_delim(code) {
    var lines = code.split('\n');
    var out = [];
    var indentation = 0;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.endsWith(':')) {
            out.push(line.slice(0, -1) + ' {');
            indentation += 1;
            continue;
        }

        if (Math.floor(count_leading_spaces(line) / 4) < indentation) {
            indentation -= 1;
            out.push('    '.repeat(indentation) + '}');
        }
        out.push(line);
    }

    while (indentation > 0) {
        indentation -= 1;
        out.push('    '.repeat(indentation) + '}');
    }

    return out.join('\n');
}

function translate_code(file, lang) {
    var python_code = EXAMPLE_FILES[file] || '';

    for (var i = 0; i < lang.rules.length; i++) {
        var src = lang.rules[i][0];
        python_code = str_replace_all(python_code, src, TOKEN_IDS[src]);
    }
    for (var j = 0; j < lang.rules.length; j++) {
        var src2 = lang.rules[j][0];
        var dst2 = lang.rules[j][1];
        python_code = str_replace_all(python_code, TOKEN_IDS[src2], dst2);
    }

    python_code = str_replace_all(python_code, '\\n', '\n');
    python_code = apply_lambda_rules(python_code, lang);

    if (lang._SEMDELIM === 'br') {
        python_code = apply_brace_delim(python_code);
    }

    return python_code;
}

function build_interpreter(lang) {
    var code = INTERPRETER_TEMPLATE;

    for (var i = 0; i < lang.rules.length; i++) {
        var src = lang.rules[i][0];
        var dst = lang.rules[i][1];
        code = str_replace_all(code, 'IM' + TOKEN_IDS[src], dst);
    }

    code = str_replace_all(code, '_SEMDELIM', lang._SEMDELIM);
    return code;
}

function download_text(filename, text) {
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function load_lang() {
    var obj = { rules: [] };

    for (var i = 0; i < TOKENS.length; i++) {
        var token = TOKENS[i];
        var selector = '#' + TOKEN_IDS[token];
        obj.rules.push([token, $(selector).val() || $(selector).attr('placeholder')]);
    }

    obj.l_name = $("#l_name").val() || $("#l_name").attr('placeholder');
    obj._SEMDELIM = $("input[name='_SEMDELIM']:checked").val();
    obj._SEMLAM = '' + $("#_SEMLAM").prop('checked');
    obj._SEMLAM_L = $("#_SEMLAM_L").val() || $("#_SEMLAM_L").attr('placeholder');

    return obj;
}

function refresh_code() {
    var lang = load_lang();
    var translated = translate_code(selected_file, lang);
    replace_it(translated);
}

$(document).ready(function() {
    setup_switch("#switch_hello", "hello_world.py");
    setup_switch("#switch_fib", "fib.py");
    setup_switch("#switch_functional", "functional.py");
    setup_switch("#switch_class", "class.py");
    setup_switch("#switch_math", "math_.py");
    setup_switch_radio("#_SEMDELIM_WS");
    setup_switch_radio("#_SEMDELIM_BR");

    $("#_SEMLAM").change(function() {
        var is_on = $("#_SEMLAM").prop('checked');
        if (is_on) {
            $("#_SEMLAM_L").removeAttr("disabled");
        } else {
            $("#_SEMLAM_L").attr("disabled", true);
        }
        refresh_code();
    });

    $("#_SEMLAM_L").change(refresh_code);

    for (var i = 0; i < TOKENS.length; i++) {
        (function(token) {
            var selector = '#' + TOKEN_IDS[token];
            $(selector).change(refresh_code);
        })(TOKENS[i]);
    }

    $("#i_download").click(function() {
        var lang = load_lang();
        var interp = build_interpreter(lang);
        download_text(lang.l_name + '.py', interp);
    });

    $("#code_reload").click(function() {
        refresh_code();
    });

    refresh_code();
});
