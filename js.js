load_lang = function() {
    obj = {rules:[]};
    alert($("#_PARR").getText());
    a = [["]", "#_ARSCR"],
	 ["[", "#_ARSCL"],
	 ["(", "#_PARL"],
	 [")", "#_PARR"],
	 ["=", "#_EQOP"]]
    a.forEach(function(v, i) {
	obj.rules.push([v[0], $(v[1]).val() || $(v[1]).attr('placeholder')]);
    });
    return JSON.stringify(obj);
}

$(document).ready(function() {
    load_lang();
    function showHiddenParagraphs() {
        $("p.hidden").fadeIn(500);
    }
    setTimeout(showHiddenParagraphs, 1000);
    $.ajax({
	url: "/translate",
	success: function(data) {
	    $("#thacode").text(data);
	}
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
