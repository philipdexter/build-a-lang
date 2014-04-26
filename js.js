$(document).ready(function() {
    function showHiddenParagraphs() {
        $("p.hidden").fadeIn(500);
    }
    setTimeout(showHiddenParagraphs, 1000);
    $("#code_reload").click(
	function() {
	    $.ajax({
		url: "/translate",
		done: function(data) {
		    alert('hi');
		}
	    });
	}
    );
});
