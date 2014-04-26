selected_file = "hello_world.py"

setup_switch = function(li, file) {
    $(li).click(function() {
	$(".pure-menu-selected").removeClass("pure-menu-selected");
	$(li).addClass("pure-menu-selected");
	selected_file = file;
	$.ajax({
	    url: "/translate/"+file,
	    success: function(data) {
		replace_it(data);
	    },
	    data: load_lang()
	});
    });
}

setup_switch_radio = function(li) {
    $(li).click(function() {
	$(".pure-menu-selected").removeClass("pure-menu-selected");
	$.ajax({
	    url: "/translate/"+selected_file,
	    success: function(data) {
		replace_it(data);
	    },
	    data: load_lang()
	});
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

replace_it = function(data) {
    var ndiv = document.createElement('div');
    ndiv.innerHTML = '<pre style="width: 60%; margin-left: auto; margin-right: auto; border: 3px solid #1f8dd6; border-radius: 15px;"><code id="thacode" data-language="python">'+htmlEscape(data)+'</code></pre>';
    Rainbow.color(ndiv, function() {
	var p = document.getElementById('thacode').parentNode;
	p.parentNode.replaceChild(ndiv, p);
    });
}

a = [["]", "#_ARSCR"],
     ["[", "#_ARSCL"],
     ["(", "#_PARL"],
     [")", "#_PARR"],
     ["==", "#_MATHEQ"],
     ["!=", "#_MATHIEQ"],
     ["<=", "#_MATHLTEQ"],
     [">=", "#_MATHGTEQ"],
     ["<", "#_MATHLT"],
     [">", "#_MATHGT"],
     ["+", "#_MATHPL"],
     ["-", "#_MATHMI"],
     ["=", "#_EQOP"]]

load_lang = function() {
    obj = {rules:[]};
    a.forEach(function(v, i) {
	obj.rules.push([v[0], encodeURIComponent($(v[1]).val() || $(v[1]).attr('placeholder'))]);
    });

    obj.l_name = encodeURIComponent($("#l_name").val() || $("#l_name").attr('placeholder'));

    var delim = $("input[name='_SEMDELIM']:checked").val();
    obj['_SEMDELIM'] = delim;

    obj['_SEMLAM'] = "" + $("#_SEMLAM").prop('checked');
    obj['_SEMLAM_L'] = encodeURIComponent($("#_SEMLAM_L").val() || $("#_SEMLAM_L").attr('placeholder'));

    return JSON.stringify(obj);
}

$(document).ready(function() {
    setup_switch("#switch_hello", "hello_world.py");
    setup_switch("#switch_for", "for_loop.py");
    setup_switch("#switch_functional", "functional.py");
    setup_switch("#switch_class", "class.py");
    setup_switch("#switch_math", "math_.py");
    setup_switch_radio("#_SEMDELIM_WS");
    setup_switch_radio("#_SEMDELIM_BR");
    $("#_SEMLAM").change(function() {
	var is_on = $("#_SEMLAM").prop('checked');
	if(is_on) {
	    $("#_SEMLAM_L").removeAttr("disabled");
	} else {
	    $("#_SEMLAM_L").attr("disabled", true);
	}
	$.ajax({
	    url: "/translate/"+selected_file,
	    success: function(data) {
		replace_it(data);
	    },
	    data: load_lang()
	});
    });
    $("#_SEMLAM_L").change(function() {
	$.ajax({
	    url: "/translate/"+selected_file,
	    success: function(data) {
		replace_it(data);
	    },
	    data: load_lang()
	});
    });
    a.forEach(function(v, i) {
	$(v[1]).change(function() {
	    $.ajax({
		url: "/translate/"+selected_file,
		success: function(data) {
		    replace_it(data);
		},
		data: load_lang()
	    });
	});
    });
    $("#i_download").click(function() {
	$(location).attr('href', '/interpreter?' + load_lang());
    });
    $.ajax({
	url: "/translate/"+selected_file,
	success: function(data) {
	    replace_it(data);
	},
	data: load_lang()
    });
    $("#code_reload").click(
	function() {
	    $.ajax({
		url: "/translate/"+selected_file,
		success: function(data) {
		    replace_it(data);
		},
		data: load_lang()
	    });
	}
    );
});
