chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "download"){
		saveCalendar(request.cal, request.term + '.ics');
	}
});
		
var saveCalendar = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var blob = new Blob([data], {type: 'text/x-vCalendar;charset=' + document.characterSet});
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());