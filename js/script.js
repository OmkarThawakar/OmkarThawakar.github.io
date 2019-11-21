$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

$("[data-toggle=popover]").popover({
  trigger:'focus',
  html: true, 
	content: function() {
          return $('#popover-content').html();
        }
});

$(".language").fadeIn(2500);

$(".corner").toggleClass("corner_rotate");

$('.logo_title').mouseenter(function(){
  $(".corner").toggleClass("corner_rotate");
});

$(function iframeLoaded() {
    var iFrameID = document.getElementById('idIframe');
    if(iFrameID) {
          // here you can make the height, I delete it first, then I make it again
          iFrameID.height = "370px";
          iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + "px";
    }   
});
                    
