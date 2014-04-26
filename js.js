$(document).ready(function() {
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
		data: '{"rules":[{"python_rep": "=", "lang_rep": "#", "il_rep": "_EQOP"}]}'
	    });
	}
    );
});
