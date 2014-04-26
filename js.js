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

replace_it = function(data) {
    var ndiv = document.createElement('div');
    ndiv.innerHTML = '<pre style="width: 60%; margin-left: auto; margin-right: auto; border: 3px solid #1f8dd6; border-radius: 5px;"><code id="thacode" data-language="python">'+data+'</code></pre>';
    Rainbow.color(ndiv, function() {
	var p = document.getElementById('thacode').parentNode;
	p.parentNode.replaceChild(ndiv, p);
    });
}

a = [["]", "#_ARSCR"],
     ["[", "#_ARSCL"],
     ["(", "#_PARL"],
     [")", "#_PARR"],
     ["=", "#_EQOP"]]

load_lang = function() {
    obj = {rules:[]};
    a.forEach(function(v, i) {
	obj.rules.push([v[0], encodeURIComponent($(v[1]).val() || $(v[1]).attr('placeholder'))]);
    });

    obj.l_name = encodeURIComponent($("#l_name").val() || $("#l_name").attr('placeholder'));

    var delim = $("input[name='_SEMDELIM']:checked").val();
    obj['_SEMDELIM'] = delim;

    return JSON.stringify(obj);
}

$(document).ready(function() {
    setup_switch("#switch_hello", "hello_world.py");
    setup_switch("#switch_for", "for_loop.py");
    setup_switch("#switch_functional", "functional.py");
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
