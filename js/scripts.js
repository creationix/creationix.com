$(document).ready(function() {
});
$(window).load(function() {
	// dynamic top margin
	function captionTop() {
		var slideImgHeight = $(".typo-slider .slide > img").height();
		var changedTop = (slideImgHeight/2)-40;
		$(".typo-slider .slide .bx-caption").css('top', changedTop + 'px');
	}
	$(window).resize(function() {
		captionTop();
	});
	captionTop();
	//  mobile menu display
	$(".menu-button").click(function(){
		$("ul.menu-links").toggleClass("menu-show");
	})
})
//  scroll page to element
function goToByScroll(id){
	$('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
}
// mobile hide URL bar
var browser         = navigator.userAgent;
var browserRegex    = /(Android|BlackBerry|IEMobile|Nokia|iP(ad|hone|od)|Opera M(obi|ini))/;
var isMobile        = false;
if(browser.match(browserRegex)) {
	isMobile            = true;
	addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false);
	function hideURLbar(){
		window.scrollTo(0,1);
	}
}
