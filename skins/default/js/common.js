/**
* Copyright 2011 All rights reserved by phiDel (www.foxb.kr, phidel@foxb.kr)
**/

jQuery.fn.extend({
	scrollIntoView: function(b) {
		var $i = this.get(0);
		if ($i != undefined && $i.scrollIntoView) $i.scrollIntoView(b ? b : true);
		return this;
	}
});

jQuery(function($)
{
	$('a[href=#siManageBtn]')
	.click(function()
	{
		$('.scElps ._first').each(function(){$(this).css('width', ($(this).width() - 30) + 'px');});
		$('.scCheck').show('slow');

		var $a = $(this).next();

		$('select', $a).change(function() {
			var v = $(this).val() || '', s = new Array();
			$('input[name=cart]:checked').each(function(i) { s[i] = $(this).val(); });
			if(s.length<1) return alert('Please select the items.') || false;
			exec_xml('beluxe', 'procBeluxeChangeCustomStatus', {mid:current_mid,new_value:v,target_srls:s.join(',')}, completeCallModuleAction);
			return;
		});

		$('a[data-type]', $a).click(function() {
			switch($(this).attr('data-type')) {
				case 'manage':popopen(request_uri+'?module=document&act=dispDocumentManageDocument','manageDocument');break;
				case 'admin': location.href = current_url.setQuery('act','dispBeluxeAdminContent');
			}; return false;
		});

		$a.show('slow');
		$(this).hide().prevAll().hide();
		return false;
	});

	$('#siCat.tabn,#siCat.colm')
	.each(function()
	{
		var $i = $(this), iscolm = $i.hasClass('colm'), $u = $('ul', this), $a = $('li.active:last', this),
			dt = parseInt($u.css("margin-top")) || 0, uh = parseInt($u.height()) - dt,
			lh = parseInt($('li:first', this).height()) + parseInt($('li:first', this).css('margin-bottom'));

		// 선택된 분류가 있으면 위치 구하고 이동
		var nn = parseInt(($a.position($i) ? $a.position($i).top : 0) / lh);
		if(nn > 0) $u.css('margin-top', ((nn * lh) * -1)  + 'px');

		if(lh >= uh)
		{
			$('.scCaNavi',this).css('display','none');
			$u.css('margin-right',iscolm ? '18px' : '0');
		}
		else
		{
			$('.scCaNavi a:eq(0)',this).click(function(){
				var t = parseInt($u.css("margin-top"));
				if(t < dt) $u.css('margin-top', (t + lh + dt) + 'px');
				return false;
			});
			$('.scCaNavi a:eq(1)',this).click(function(){
				var t = parseInt($u.css("margin-top"));
				if((t - lh - dt) > -uh) $u.css('margin-top', (t - lh - dt) + 'px');
				return false;
			});
		}

		if(iscolm)
		{
			var $p = $('#siLst:not(.noheader):eq(0), #siHrm:not(.noheader):eq(0)'),
				$k = $('.scCaLock',this), cok = getCookie('scCaLock');

			if(!$p.length) return;
			if($p.length>1) $p = $($p.get(0));

			// 초반에 크기를 구하기 위해 visibility:hidden 사용했기에 숨기고 다시 켠다.
			$i.css({'display':'none','visibility':'visible'});
			$i.css({'top':$p.position().top+'px','width':$p.width()-10+'px'});

			if($k){
				$k.click(function() {
					if($(this).hasClass('active')){
						$(this).removeClass('active');
						setCookie('scCaLock','hide',null,'/');
					} else {
						$(this).addClass('active');
						setCookie('scCaLock','',null,'/');
					}
					return false;
				});
				if(cok=='hide') $k.removeClass('active');
			}

			if($i.attr('data-autohide') == 'true'){
				$('thead tr:first th:not(.sort), ul.scFrm:first', $p).mouseenter(function(e){
					var te = e.target, $isSp = $('> span.sort:eq(0)',te);
					if($isSp.length && (e.offsetX > $isSp.position().left)) return;
					$i.trigger('fadeIn.fast');
				});
				$(document).mousemove(function(e){
					var te = e.target;
					if ($(te).parents().add(te).index($i) > -1) return;
					if(!$i.is(':hidden')&&$i.css('opacity')=='1'&&!$k.hasClass('active')) $i.fadeOut();
				});
			}

			$i.bind('fadeIn.fast', function(){
				$(this).css({'top':$p.position().top+'px','width':$p.width()-10+'px'}).fadeIn('fast');
			}).bind('fadeOut.fast', function(){
				$i.fadeOut();
			});
		}
	});

	$('#siCat.side')
	.each(function()
	{
		var $pr = $(this), $ca = $('.cateArea',$pr), $ul = $('ul.scFrm',$pr), $bt = $('.mubtn', $pr);

		$bt.click(function(){
			uw = $ul.outerWidth(true), bw = $bt.outerWidth(true) + 1;
			// right 이면 범위를 벗어나기 때문에 크기 계산
			if($ca.hasClass('right')) $ca.css({'margin-left':-(uw+bw)+'px','width':(uw+bw)+'px'});
			$ul.animate(
				{"width": "toggle", "opacity": "toggle"}, "slow",
				function(){
					if($ul.is(':hidden')){
						$bt.removeClass('active');
						if($ca.hasClass('right')) $ca.css({'margin-left':-bw+'px','width':bw+'px'});
					}
					else $bt.addClass('active');
				}
			);
			return false;
		});

		$('ul.scFrm li[data-child]', $pr).each(function() {
			var key = $(this).attr('data-child'), $to = $('ul.scFrm li[data-parent='+key+']', $pr);

			$('a b:first', this).click(function(){
				if($ca.hasClass('right')) $ca.css({'margin-left':'-1000px','width':'1000px'});
				$(this).html($to.is(':hidden')?'&rsaquo;':'&lsaquo;');
				$to.slideToggle();

				if($ca.hasClass('right')){
					uw = $ul.outerWidth(true), bw = $bt.outerWidth(true) + 1;
					$ca.css({'margin-left':-(uw+bw)+'px','width':(uw+bw)+'px'});
				}
				return false;
			}).css('color','black').html($to.css('display')=='none'?'&lsaquo;':'&rsaquo;');
		});
	});

	$('#siLst.gall .scInfo[data-autohide=true]')
	.each(function()
	{
		var $i = $(this),$p = $i.closest('.scItem'), $n = $('.nick_name',this),
			$m = $i.prev('span.prtImg'), fade = $i.attr('data-fade') == 'true';

		$p.mouseenter(function(e)
		{
			$m.hide('slow');
			if(fade) $i.fadeIn('slow'); else $i.slideDown();
			$n.show('slow');
		}).mouseleave(function(e)
		{
			$n.hide('slow');
			if(fade) $i.fadeOut(); else $i.slideUp();
			$m.show('slow');
		});
	});

	$('label p.scItemDesc[data-target]')
	.each(function()
	{
		var $i = $(this), t = $i.attr('data-target'), $e = $('label #' + t);
		$e.focusin(function(){$i.fadeOut('fast')}).focusout(function(){$e.val() || $i.fadeIn('slow')});
	});

	$('.scSns a')
	.click(function()
	{
		var $o = $('#siHrm li.scElps strong:eq(0)'), v, t = $(this).attr('data-type'),
			co = encodeURIComponent($o.text().trim()), rl = encodeURIComponent($o.attr('title'));
		switch(t)
		{
			case 'me': v = 'http://me2day.net/posts/new?new_post[body]=%22' + co + '%22%3A' + rl; break;
			case 'fa': v = 'http://www.facebook.com/share.php?t=' + co + '&u=' + rl; break;
			case 'de': v = 'http://www.delicious.com/save?v=5&noui&jump=close&url=' + rl + '&title=' + co; break;
			default: v = 'http://twitter.com/home?status=' + co + ' ' + rl; break;
		}
		popopen(v, '_pop_sns');
		return false;
	});

	$('a[href=#tbk_action][class=delete]')
	.click(function()
	{
		if(!confirm('Do you want to delete the selected trackback?')) return false;
		var srl = $(this).closest('li').find('a[name^=trackback_]').attr('name').replace(/.*_/g,'');
		exec_xml('beluxe', 'procBeluxeDeleteTrackback', {mid:current_mid,trackback_srl:srl}, completeCallModuleAction);
		return false;
	});

	$('a[href=#history][data-srl]')
	.click(function()
	{
		var srl = $(this).attr('data-srl') || 0;
		popopen(request_uri+'?mid='+current_mid+'&act=dispBoardHistory&history_srl='+srl+'&is_poped=1','documentHistory');
		return false;
	});

	$('a[href=#his_action][data-mode=delete][data-srl]')
	.click(function()
	{
		if(!confirm('Do you want to delete the selected history?')) return false;
		var srl = $(this).attr('data-srl') || 0,doc = $(this).attr('data-doc') || 0;
		exec_xml('beluxe', 'procBeluxeDeleteHistory', {mid:current_mid,history_srl:srl,document_srl:doc}, completeCallModuleAction);
		return false;
	});

	$('a[href^=#][href$=recommend][data-type]')
	.click(function()
	{
		var $i = $(this), hr = $i.attr('href'), ty = $i.attr('data-type'), srl = $i.attr('data-srl');
		var params = {target_srl : srl, cur_mid : current_mid, mid : current_mid};

		exec_xml(
			ty, (hr == '#recommend' ? 'proc' + ty.ucfirst() + 'VoteUp' : 'proc' + ty.ucfirst() + 'VoteDown'), params,
			function(ret_obj) {
				alert(ret_obj['message']);
				if(ret_obj['error']=='0')
				{
					var $e = $i.find('em.cnt');
					$e.text((parseInt($e.text()) || 0) + (hr == '#recommend' ? 1 : -1));
				}
			}
		);
		return false;
	});

	$('a[href=#declare][data-type]')
	.click(function()
	{
		var $i = $(this), ty = $i.attr('data-type'), srl = $i.attr('data-srl'), rec = $i.attr('data-rec') || '0';
		var params = {target_srl : srl, cur_mid : current_mid, mid : current_mid};
		var c = (prompt(sj_declare_message, '') || '').trim();
		if(!c) return alert('Cancel') || false;

		exec_xml(
			ty, 'proc' + ty.ucfirst() + 'Declare', params,
			function(ret_obj) {
				alert(ret_obj['message']);
				if(ret_obj['error']=='0')
				{
					if(rec=='0') return location.reload() || false;
					var t = '[Board DX] Declare, ' + ty + ':' + srl,
						u = current_url.setQuery('comment_srl',('comment'?srl:''));
						c = c + '<br /><br /><a href="' + u + '">'+u+'</a>';
					var params2 = {receiver_srl : rec, title : t, content : c};
					exec_xml('communication', 'procCommunicationSendMessage', params2,
						function(ret_obj2) {
							alert(ret_obj2['message']);
							location.reload();
						}
					);
				}
			}
		);
		return false;
	});

	$('#siFbk .scFbWt form textarea[name=content]')
	.focus(function()
	{
		$('.scWusr', $(this).closest('form')).show('slow');
	});

	$('.scHLink[data-href]')
	.click(function()
	{
		window.open($(this).attr('data-href'), ($(this).attr('data-target') || ''));
		return false;
	});

	$('.scToggle[data-target]')
	.click(function()
	{
		$($(this).attr('data-target')).slideToggle();
		return false;
	});

	$('.scClipboard')
	.click(function()
	{
		var tg = $(this).attr('data-attr') || false;
		prompt('press CTRL+C copy it to clipboard...', (tg ? $(this).attr(tg) : $(this).text()));
		return false;
	});

	// ie8 이하에서 last css fix
	if($.browser.msie===true&&Math.floor($.browser.version)<9)
	{
		$('#siLst thead tr th:not(hidden):last div').css('border-right-width','1px');
	}

	$(window)
	.load(function()
	{
		$('.scElps[data-active=true]')
		.each(function(e)
		{
			var $i = $(this), $f = $('> :eq(0)', $i),$l = $('> :eq(1)', $i),fw = $i.width(),lw = 0;
			if($l.length)
			{
				if($('> img', $l).length || $l.text().trim())
					lw = $l.addClass('_last').outerWidth(true);
				else $l.remove();
			}
			if($.browser.msie===true) $f.height($i.css('line-height') || 15);
			$f.css('width',(fw - lw - 5) + 'px').addClass('_first');
		});

		$('.scContent [data-hottrack]')
		.each(function(e)
		{
			var $i = $(this), ix = $i.attr('data-index'), tp = $i.attr('data-type'), ur = $i.attr('data-hottrack'),
				$a = $('<a class="scHotTrack" />').attr('data-index', ix).attr('href', ur),
				w = $i.outerWidth(tp != 'gall') - (tp == 'widg' ? 8 : 4),
				h = $i.outerHeight(tp == 'webz') + (tp == 'lstcont' ? $('#siHotCont_' + ix).height() : 0) - 4;

			$a.css({'width':w+'px','height':h+'px'});
			if($i.get(0).tagName=='TR') {
				var $td = $i.find('>td:eq(0)');
				if($.browser.mozilla===true) {
					var $cs = $('<span>').css({'position':'relative','display':'block'})
						.css({'padding-left':$td.css('padding-left'),'padding-top':$td.css('padding-top')}).html($td.html());
					$a.prependTo($cs.prependTo($td.html('').css({'padding-left':'0','padding-top':'0','vertical-align':'top'})));
				} else $a.prependTo($td.css({'position':'relative'}));
			} else $a.prependTo($i);

			if($.browser.msie===true) $('<span class="iefix" />').css({'width':w+'px','height':h+'px'}).appendTo($a);
		});

		if(getCookie('scCaLock')!='hide') $('#siCat.colm').trigger('fadeIn.fast');
		$('#siFbk a[name^=comment][data-scroll=true]').last().parent().scrollIntoView();

		var wmd = (getCookie('write_mode') || '').split('/');
		if(wmd.length) {
			setCookie('write_mode','',null,'/');
			var tmp = 'a.modalAnchor[href=#siModalWin][data-mode=';

			if(wmd[0] == 'comment') {
				$(tmp + wmd[1] + '][data-type=comment]', $('a[name=comment_'+wmd[2]+']').closest('li')).click();
			} else if(wmd[0] == 'insert' || wmd[0] == 'update' || wmd[0] == 'delete'){
				$(tmp + wmd[0] + '][data-type!=comment]').click();
			}
		}
	});
});