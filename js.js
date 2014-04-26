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
    return JSON.stringify(obj);
}

$(document).ready(function() {
    function showHiddenParagraphs() {
        $("p.hidden").fadeIn(500);
    }
    setTimeout(showHiddenParagraphs, 1000);
    a.forEach(function(v, i) {
	$(v[1]).change(function() {
	    $.ajax({
		url: "/translate",
		success: function(data) {
		    $("#thacode").text(data);
		},
		data: load_lang()
	    });
	});
    }
    $.ajax({
	url: "/translate",
	success: function(data) {
	    $("#thacode").text(data);
	},
	data: load_lang()
    });
    $("#code_reload").click(
	function() {
	    $.ajax({
		url: "/translate",
		success: function(data) {
		    $("#thacode").text(data);
		},
		data: load_lang()
	    });
	}
    );
});
