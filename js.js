$(document).ready(function() {
    function showHiddenParagraphs() {
        $("p.hidden").fadeIn(500);
    }
    setTimeout(showHiddenParagraphs, 1000);
    $("#code_reload").click(
	function() {
	    $.ajax({
		url: "/translate",
		success: function(data) {
		    $("#thacode").text(data);
		}
	    });
	}
    );
});
