String.prototype.rule = function(type){
	switch(type) {
		case 'number': return !(/[^0-9]+/g.test(this)); break;
	}
	return false;
};

jQuery(function($)
{
	function bdxDeclareBtninit() {
		var $i = $(this), ty = $i.attr('data-type'), srl = $i.attr('data-srl'), rec = $i.attr('data-rec') || '0';
		var params = {target_srl : srl, cur_mid : current_mid, mid : current_mid};
		var c = (prompt('Please describe the reasons.', '') || '').trim();
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
	}

	function bdxVoteBtninit() {
		var $o = $(this), hr = $o.attr('href'), ty = $o.attr('data-type'), srl = $o.attr('data-srl');
		var params = {target_srl:srl,cur_mid:current_mid,mid:current_mid};
		exec_xml(
			ty, (hr == '#recommend' ? 'proc' + ty.ucfirst() + 'VoteUp' : 'proc' + ty.ucfirst() + 'VoteDown'), params,
			function(ret_obj) {
				alert(ret_obj['message']);
				if(ret_obj['error']=='0')
				{
					var $e = $o.find('em.cnt');
					$e.text((parseInt($e.text()) || 0) + (hr == '#recommend' ? 1 : -1));
				}
			}
		);
		return false;
	}

	$('a[href^=#][href$=recommend][data-type]').click(bdxVoteBtninit);
	$('a[href=#declare][data-type]').click(bdxDeclareBtninit);

	$('#xe_message:eq(0)').each(function(){
		alert($('p',this).text());
	});
	$('#read:first').each(function(){
		$('.co .mm').next().hide();
		$('.mm').click(function(){ $(this).hide().next().show();});
		$('.tgo').removeClass('open');
		$('.tg').click(function(){
			$(this).parent('.h3').next('.tgo').toggleClass('open');
		});
	});

	$('form input[type=text][name=exfield_start_point]').each(function(){
		var v = xe.getApp('Validator')[0];
		if (!v) return false;
		v.cast('ADD_RULE', ['auction_number', /^[1-9][0-9]*$/]);
		v.cast('ADD_RULE', ['phone_number', /[0-9\-]+$/]);
		v.cast("ADD_MESSAGE", ["invalid_auction_number",__XEFM_LANG__['invalid_auction_number']]);
		v.cast("ADD_MESSAGE", ["invalid_phone_number",__XEFM_LANG__['invalid_phone_number']]);
	});

	$('form.inComfrm').submit(function(){
		var $vp = $('input[name=vote_point]',this),
			point = $vp.val(),
			min = $vp.attr('data-min'),
			max = $vp.attr('data-max');

		if(!point) {
			$vp.focus();
			return false;
		}

		if(!point.rule('number')) {
			alert('This is not a number.');
			$vp.focus();
			return false;
		}else{
			point = Number(point);
			max = Number(max);
			min = Number(min);
			if(isNaN(point)||isNaN(min)||isNaN(max)) return false;

			if(point < 1) {
				alert('Please enter a value more than zero.');
				$vp.focus();
				return false;
			}
		}

		if(point < min) {
			alert('Must exceed a minimum size.');
			$vp.focus();
			return false;
		}

		if(point > max) {
			alert('Can not exceed the maximum size.');
			$vp.focus();
			return false;
		}

		$vp.val(point);
	});
});
