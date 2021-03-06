$(function() {
    
	// [1] 전체 틀
	// 페이지 단위로 넘기는 제이쿼리
	(function($){
        $.aniPage=function(e,type){
            if(e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0){
                $("body, html").animate({
                    scrollTop:$(window).scrollTop()-$(window).height()
                },1000,function(){
                        $.aniOk = 0;
                });
            }else{
                $("body, html").animate({
                    scrollTop:$(window).scrollTop()+$(window).height()
                },1000,function(){
                        $.aniOk = 0;
                });
            }
        };
    })(jQuery);
    $(function(){
        $(".page").height($(window).height());
        $.aniOk=0;
        $(window).scrollTop(0);
    });
    $(document).on("mousewheel DOMMouseScroll",function(e){
        e.preventDefault();
        if($.aniOk == 0){
            $.aniPage(e,e.type);
            $.aniOk = 1;
        }
    });

	// [2] 네비메뉴
	// 네비메뉴 선택했을 때
	 $('nav li').click(function(event){
		event.preventDefault();
		
		var tg = $(this);
		var i = tg.index();
		console.log(i);
		var section = $('article').eq(i);

		var tt = section.offset().top;
		
		$('html, body').stop().animate({scrollTop:tt});
	 });

	// 현재 페이지 네비버튼에 애니메이션 들어오도록
	 $(window).scroll(function(){
	  var sct = $(window).scrollTop();
	 
	  $("article").each(function(){
		var tg = $(this);
		var i = tg.index();
		 if(tg.offset().top <= sct){
			 $("#header nav li").removeClass('on');
			 $("#header nav li").eq(i).addClass('on');
		 }
	 });
   });


   //[3] 프로필
   // About me _ My Interest hover시 설명
   $('.explain').hide();
   $('.interest li').mouseenter( 
	   function(){
		   $(this).find('.explain').show();
	   }
	   
	);
	$('.interest li').mouseleave( 
		function(){
			$('.explain').hide();
		}
	 );


   // [4] 기술
   // 자격증 모달
   $(".open_btn_box").click(function(e){
	   e.preventDefault();
	   $('.license_modal').show();
   });

   $(".my_skills header > .ttl").click(function(){
		$('.license_modal').show();
   });	  

   $(".close_btn").click(function(e){
	   e.preventDefault();
	$('.license_modal').hide();
   });
	 

   // [5] 프로젝트
   // [5-1,2] 프로젝트 버튼 효과
   $(".proj_btns > li").mouseenter(
	   function(){
		   $(this).find("p").stop().animate({"width":"100px"}, 500)
	   }
   );
   $(".proj_btns > li").mouseleave(
	function(){
		$(this).find("p").stop().animate({"width":"0"}, 500)
	}
);


});