/* NHN (developers@xpressengine.com) Modal Window
 * @Optimizer for XE by phiDel (http://foxb.kr) */

jQuery.fn.xeModalFlashFix = function(){
	var $ = jQuery;
	$('embed[type*=flash]',this).each(function(){var o=$(this);if(o.attr('wmode')!='transparent')o.attr('wmode', 'opaque')});
	$('iframe[src*=youtube]',this).each(function(){var o=$(this);o.attr('src',(o.attr('src')).setQuery('wmode', 'opaque'))});
}

jQuery(function($)
{
	var ESC = 27;

	$.fn.xeModalWindow = function(){
		this
			.not('.xe-modal-window')
			.addClass('xe-modal-window')
			.each(function(){
				$( $(this).attr('href') ).addClass('x').hide();
			})
			.click(function(){
				var $this = $(this), $modal, $btnClose, target = $this.attr('data-target') || '';

				// get and initialize modal window
				$modal = $( $this.attr('href') );
				if(!target && !$modal.parent('body').length) {
					$btnClose = $('<button type="button" class="modalClose" title="Close this layer">X</button>');
					$btnClose.click(function(){ $modal.data('anchor').trigger('close.mw');});

					$modal.prepend('<span class="bg"></span>')
						.append('<!--[if IE 6]><iframe class="ie6"></iframe><![endif]-->')
						.find('>.fg').prepend($btnClose).end().appendTo('body');
				}
				else if(target)
				{
					if($modal.data('state') == 'showing') $this.trigger('close.mw');
					$(target).before($modal);
					$modal.data('current_target', target);
				}

				// set the related anchor
				$modal.data('anchor', $this);

				if($modal.data('state') == 'showing') {
					$this.trigger('close.mw');
				} else {
					$this.trigger('open.mw');
				}

				return false;
			})
			.bind('open.mw', function(){
				var $this = $(this), before_event, $modal, duration, current_target;

				// before event trigger
				before_event = $.Event('before-open.mw');
				$this.trigger(before_event);

				// is event canceled?
				if(before_event.isDefaultPrevented()) return false;

				// get modal window
				$modal = $( $this.attr('href') );
				current_target = $modal.data('current_target') || null;

				// get duration
				duration = $this.data('duration') || 'fast';

				// set state : showing
				$modal.data('state', 'showing');

				// workaroud for IE6
				$('html,body').addClass('modalContainer');

				// after event trigger
				function after(){$this.trigger('after-open.mw');};

				$(document).bind('keydown.mw', function(event){
					if(event.which == ESC) {
						$this.trigger('close.mw');
						return false;
					}
				});

				$(current_target).hide('fast');
				$modal
					.fadeIn(duration, after)
					.find('>.bg').height($(document).height()).end()
					.find('button.modalClose:first').focus();
			})
			.bind('close.mw', function(){
				var $this = $(this), before_event, $modal, duration, current_target;

				// before event trigger
				before_event = $.Event('before-close.mw');
				$this.trigger(before_event);

				// is event canceled?
				if(before_event.isDefaultPrevented()) return false;

				// get modal window
				$modal = $( $this.attr('href') );
				current_target = $modal.data('current_target') || null;

				// get duration
				duration = $this.data('duration') || 'fast';

				// set state : hiding
				$modal.data('state', 'hiding');

				// workaroud for IE6
				$('html,body').removeClass('modalContainer');

				// after event trigger
				function after(){$this.trigger('after-close.mw');};

				$modal.fadeOut(duration, after);
				$(current_target).show('fast');
				$this.focus();
			});
	};

	/** phiDel (www.foxb.kr, phidel@foxb.kr) **/

	$('a.modalAnchor').xeModalWindow();
	$('div.modal').addClass('x').hide();

	$.fn.writeSkinIframe = function(url) {
		var $this = $(this), top, $msg, $msg2, frId = $(this).attr('data-frame') || 'siOframe';

		// 메세지 위로 올림
		if($('.message').length || $('.wfsr').length)
		{
			top = ($this.data('current_target') || '') ? $(window).scrollTop() : 0;
			if($('.message').length) $msg = $('.message:eq(0)').clone(true);
			if($('.wfsr').length)
			{
				$msg2 = $('<div class="message update wait">').html(
							'<p>' + waiting_message + '<br />If time delays continue, <a href="' + url.setQuery('is_modal','0') + '"><b>click here</b></a>.</p>'
						);
				$msg = $msg ? $msg.css('top', (top + 10) + 'px').after($msg2.css('top', (top + 60) + 'px')) : $msg2.css('top', (top + 10) + 'px');
			}

			$(frId == 'siOframe' ? this : 'body').append($msg.attr('modalMessage','1').css({'position':'absolute','left':'10px','z-index':'9'}));
		}

		// ie6~8 은 object 못씀
		if(/msie|chromium/.test(navigator.userAgent.toLowerCase()) === true) {
			$('#'+frId, $this).length ?
				window.frames[frId].location.replace(url) :
				$('<iframe id="'+frId+'" allowTransparency="true" frameborder="0" scrolling="'+(frId == 'siOframe' ? 'auto' : 'no')+'" />')
					.attr('src', url).appendTo($('fieldset:eq(0)', $this));
		} else {
			$('#'+frId, $this).length ?
				$('#'+frId, $this).attr('data', url):
				$('<object id="'+frId+'" style="overflow-x:hidden;overflow-y:'+(frId == 'siOframe' ? 'auto' : 'hidden')+'" />')
					.attr('data', url).appendTo($('fieldset:eq(0)', $this));
		}
	};

	$('a.modalAnchor:([data-mode=insert],[data-mode=update],[data-mode=delete],[data-mode=reply])')
	.bind('before-open.mw', function(e)
	{
		var $modal = $($(this).attr('href')),
			mode = $(this).attr('data-mode'),
			type = $(this).attr('data-type'),
			agree = $(this).attr('data-agree'),
			url = current_url;

		// 로딩중 안보이게 처리
		if(($modal.attr('data-frame') || 'siOframe') == 'siOframe') $('div.fg', $modal).css('left','-9900px');

		var is_c = (type != undefined && type == 'comment');

		var params = url.getEntryQuerys();
		params['mid'] = current_mid;
		params['act'] = 'dispBoard' + (mode=='delete'?'Delete':'Write') + (is_c?'Comment':'');
		if(mode=='insert'||mode=='reply') params[(is_c?'comment_srl':'document_srl')] = '';
		if(agree != undefined) params['is_topic_vote'] = agree;

		// 댓글이거나 새글이 아닐때 번호 필요
		if(mode!='insert' || is_c)
		{
			var srl = $(this).attr('data-srl') || '';
			if(srl)
			{
				srl = srl.split(',');
				params['document_srl'] = srl[0];
				if(srl[1] != undefined) params[mode=='reply'?'parent_srl':'comment_srl'] = srl[1];
			}
			else
			{
				if(mode!='insert' && is_c) {
					srl = $(this).closest('li').find('a[name^=comment_]').attr('name').replace(/.*_/g,'');
					params[mode=='reply'?'parent_srl':'comment_srl'] = srl;
				}

				if(!params['document_srl']) {
					srl = $(this).closest('.scItem').find('a[name^=document_]').attr('name').replace(/.*_/g,'');
					if(srl == undefined || !srl) {
						alert('Can not find the document_srl.');
						return true;
					}
					params['document_srl'] = srl;
				}
			}
		}

		// 플랫폼 방식은 ie 때문에 처리할게 너무 많다. iframe 방식으로 통일하자.
		params['is_modal'] = '1';
		$modal.writeSkinIframe(url.setEntryQuerys(params));

	})
	.bind('after-close.mw', function(e)
	{
		var $modal = $($(this).attr('href'));
		$('.message', $modal).remove();
	});

});
