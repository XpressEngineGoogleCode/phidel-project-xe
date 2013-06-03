/**
 * @author phiDel (phidel@foxb.kr)
 * @update 2011/08/08
 **/

var __XEFM_NAME__ = 'beluxe';

String.prototype.ucfirst = function()
{
	var s=this;return s.charAt(0).toUpperCase() + s.slice(1);
};

jQuery(function($)
{
	var sjAdmTempKey = -1;

	function open_find_langcode(tar)
	{
		if(tar == undefined || !tar) return false;
		var url = request_uri.setQuery('module','module').setQuery('act','dispModuleAdminLangcode').setQuery('target',tar);

		// ie error prevention
		var iefix = tar.replace(/-/gi,'_');

		try {
			if(typeof(winopen_list[iefix]) != 'undefined' && winopen_list[iefix]) {
				winopen_list[iefix].close();
				winopen_list[iefix] = null;
			}
		} catch(e) {
		}

		var win = window.open(url, iefix, "width=650,height=500,scrollbars=yes,resizable=yes,toolbars=no");
		winopen_list[iefix] = win;

		// ie not working
		//$(win).unload(function() {$('#' + tar, parent.document).focus();});

		var timer = setInterval(function() {
			if(win != undefined && win.closed) {
				clearInterval(timer);
				$('#' + tar).focus();
			}
		}, 500);

		return false;
	}

	$.fn.bdxSiteMapinit = function(){

		$('form.siteMap', this).delegate('li:not(.placeholder)', {'mousedown.st' : function(event) {
			if($(event.target).is('em,.jPicker .Icon span.Image,span.x_input-append a.modalAnchor,span.x_input-append a.modalAnchor i,span.x_input-append button.remover,span.x_input-append button.remover i')) {
				event['which'] = 0;
			}
			return;
		}});

		$('form.siteMap', this).delegate('li:not(.placeholder)', 'dropped.st', function() {
			var $this = $(this), $pkey, is_child;

			$pkey = $this.find('>input._parent_key');
			is_child = !!$this.parent('ul').parent('li').length;

			if(is_child) {
				$pkey.val($this.parent('ul').parent('li').find('>input._item_key').val());
			} else {
				$pkey.val('0');
			}
		});

		$('a[href=#addMenu]', this).click(function() {
			var $li = $(addSitemapMenuSample);
			$li.find('>input._item_key').val(sjAdmTempKey--);
			$li.find('>input._item_title').attr('id', 'cate_title'+sjAdmTempKey);
			$li.find('>span.side>label>._item_color').attr('data-target', 'cate_color'+sjAdmTempKey).parent().attr('id', 'cate_color'+sjAdmTempKey);
			$('.lang_code', $li).xeApplyMultilingualUI();
			//$('.lang_code:eq(1)', $li).focus(function() {
			//	var $_ph = $(this).parent();
			//	$(this).css('width', ($_ph.parent().width() - (parseInt($_ph.parent().css('text-indent'))||0) - $_ph.next('.side').width() - 100) + 'px');
			//}).blur(function() {$(this).css('width', '');});
			$li.appendTo($('#nav_category', $(this).closest('form'))).bdxSiteMapinit();
			return false;
		});

		$('a[href=#delete]', this).click(function() {
			if(!confirm(xe.lang.confirm_delete)) return false;

			var module_srl = $(this).closest('form').find('>input[name=module_srl]').val(),
				category_srl = $(this).closest('li').find('>input._item_key').val(),
				params = {'module_srl':module_srl,'category_srl':category_srl},
				cateFuncDel = 'proc' + (__XEFM_NAME__).ucfirst() + 'AdminDeleteCategory';

			if(category_srl > 0){
				exec_xml(__XEFM_NAME__, cateFuncDel, params, completeCallModuleAction);
			}else{
				$(this).closest('li').remove();
			}
			return false;
		});

		$('.cbSelect', this).click(function() {
			var $this = $(this),
				$dl = $this.data('dl');

				if($dl == undefined)
				{
					$dl = $('dl', $this);
					$dl.data('type', $this.attr('data-type'));
					$this.data('dl', $dl);
					oidx = $this.attr('data-index');

					$dl.bind('close.dl', function(){
						if($dl.data('type')!='array'&&$dl.data('type')!='panel') return;

						var ins = new Array(),
							idx = 0;
						if($dl.data('type')=='array') {
							$('input:checked', $dl).each(function(){ins[idx++] = $(this).val();});
						} else {
							$('input[type=checkbox]', $dl).each(function(){ins[idx++] = $(this).is(':checked')?$(this).val():'';});
							$('select', $dl).each(function(){ins[idx++] = $(this).val();});
							$('input[type=text][id!=item_color]', $dl).each(function(){ins[idx++] = $(this).val();});
							$('input[type=text][id=item_color]:eq(0)', $dl).each(function(){
								var col = $(this).val() || '', isc = col && col !='transparent',
									tid = $('._item_color', $this).attr('data-target') || '';
								$('._item_color', $this).val(col);
								if(tid){
									$('#'+tid).css({
										'border':isc ? ('2px solid ' + col) : '',
										'border-left-width':isc ? '1px' : '',
										'border-right-width':isc ? '1px' : ''
									});
								}
							});
						}
						var val1 = $('._value', $this).val(),
							val2 = ins.join('|@|');
						$('._value', $this).val(val2);
						if(val1 != val2) $('._title', $this).css('color', ins.length?'red':'');
					});

					// event 연결은 처음에 한번만 해야지 많이 하면 Overflow
					//$('._title', $this).click(function(){$this.click();});

					$(document).mousedown(function(event){
						var target = event.target;
						if ($(target).parents().add(target).index($dl) > -1) return;
						$dl.trigger('close.dl');
						$dl.hide();
					});

					$dl.appendTo('body');

					if(oidx != undefined) {
						$dl.html(addSitemapMenuSampleOption[oidx]);
						if($dl.attr('default')=='default') $('dt.defi,option.defi',$dl).remove();
						if(oidx=='1') {
							var col = $('._item_color', $this).val() || '', tval = $('._value', $this).val();
							$('input.color-indicator', $dl).val(col).xe_colorpicker();
							tval = tval.split('|@|');
							var objs = $('input[type=checkbox],select,input[type=text][id!=item_color]', $dl);
							for(var i=0, c=objs.length;i<c;i++) {
								var type = $(objs[i]).attr('type');
								switch(type) {
									case('checkbox'):
										if(tval[i]=='Y') $(objs[i]).attr("checked", "checked");
									break;
									default: $(objs[i]).val(tval[i]);
								}

							}
						}
					}

					$('dt', $dl).click(function(event) {
						var target = event.target,
							$dt = $(this);
						if(target.tagName == 'INPUT'||target.tagName == 'SELECT') return;
						if($dl.data('type')=='array'||$dl.data('type')=='panel') {
							$dl.trigger('close.dl');
							$dl.hide();
						} else {
							$('._title', $this).text($dt.text());
							$('._value', $this).val($dt.attr('data-val'));
							$('._option', $this).val($dt.attr('data-opt'));
							$dl.hide();
						}
					});

					if($dl.data('type')=='array'||$dl.data('type')=='panel'){
						$('input[type=checkbox]', $dl).click(function(event) {
							$dl.trigger('close.dl');
						});
					}
				}

				var $ch = $('#siteMapFrame');
				$dl.css('left',$this.offset().left + 'px');

				if(
					(($ch.offset().top + $ch.height()) < ($this.offset().top + $dl.height() + 16))
					&& ($dl.height() < ($this.offset().top - $ch.offset().top))
				)
					$dl.css('top',$this.offset().top - $dl.height() - 16 + 'px');
				else
					$dl.css('top',$this.offset().top + 9 + 'px');

				$dl.show();

			return false;
		});
	};

	$.fn.bdxColumninit = function(){
		$('input:checkbox.column_option', this).click(function()
		{
			var $par = $(this).closest('div.wrap'),
				option = new Array();
			option[0] = $('input:checkbox#column_display', $par).is(':checked')?'Y':'N';
			option[1] = $('input:checkbox#column_sort', $par).is(':checked')?'Y':'N';
			option[2] = $('input:checkbox#column_search', $par).is(':checked')?'Y':'N';
			$('input:hidden#column_option', $par).val(option.join('|@|'));
		});
	};

	$.fn.bdxExtraKeyinit = function(){
		var $this = $(this);

		$this.submit(function(){
			var $eids = $('input._extra_eid', $this);
			for(var i=0, c=$eids.length; i<c; i++){
				var sv = $($eids.get(i)).val().trim(),
					patt = /^[^a-z]|[^a-z0-9_]+$/g;
				if(sv == undefined || patt.test(sv)){
					alert(xe.lang.msg_invalid_eid);
					$($eids.get(i)).focus();
					return false;
				}
			}
			return true;
		});

		$('input:checkbox.extra_option', $this).click(function(){
			var $par = $(this).closest('div.wrap'),
				option = new Array();
			option[0] = $('input:checkbox#is_required', $par).is(':checked')?'Y':'N';
			$('input:hidden#extra_option', $par).val(option.join('|@|'));
		});

		$('a[href=#addMenu]', $this).click(function() {
			var $tr = $(addExtraKeysSample);
			$('.lang_code', $tr).xeApplyMultilingualUI();
			$tr.appendTo($('#extrakey_list .lined:first', $(this).closest('form'))).bdxExtraKeyinit();
			return false;
		});

		$('a[href=#delete]', $this).click(function() {
			if(!confirm(xe.lang.confirm_delete)) return false;

			var module_srl = $(this).closest('form').find('>input[name=module_srl]').val(),
				extra_idx = $(this).closest('.wrap').find('>input._extra_idx').val(),
				params = {'module_srl':module_srl,'extra_idx':extra_idx},
				cateFuncDel = 'proc' + (__XEFM_NAME__).ucfirst() + 'AdminDeleteExtraKey';

			if(extra_idx != undefined && extra_idx !== 0){
				exec_xml(__XEFM_NAME__, cateFuncDel, params, completeCallModuleAction);
			}else{
				$(this).closest('tr').remove();
			}
			return false;
		});
	};

	$.fn.bdxInsertinit = function(){
		var f = this;

		$.fn.bdxDfTypeSelect = function(){
			$(this).change(function() {
				var def = $(this).attr('data-default') || '', ots= ($("option:selected", this).attr('data-option') || '').split('|@|');
				if(ots.length==5)
				{
					$('select[name=default_sort_index]', f).val(ots[0]);
					$('select[name=default_order_type]', f).val(ots[1]);
					$('input[name=default_list_count]', f).val(ots[2]);
					$('input[name=default_page_count]', f).val(ots[3]);
					$('input[name=default_clist_count]', f).val(ots[4]);
				}
				if(def != $(this).val()) $(this).closest('div.x_control-group').addClass('opt_bks');
				else $(this).closest('div.x_control-group').removeClass('opt_bks');
			});
		}

		$('select[name=default_type]', f).bdxDfTypeSelect();

		$('select[name=skin]', f).change(function() {
			var $i = $(this), $li = $i.closest('div.x_control-group'), def = $i.attr('data-default') || '', skin = $i.val() || '';
			$li.next().hide();
			$li.next().find('> div.x_controls:eq(0) > select').hide().attr('name','');
			$li.find('> p.msg_call_server').show();
			var $s = $li.next().find('> div.x_controls:eq(0) > select[data-skin='+skin+']');

			if($s .length)
			{
				$li.find('> p.msg_call_server').hide();
				$s.attr('name','default_type').show().change();
				$li.next().show();
			}
			else
			{
				exec_xml('beluxe', 'getBeluxeAdminSkinTypes',  {skin : skin},
					function(ret) {
						if(ret['error']=='0')
						{
							var $o = $(ret['html']);
							$o.bdxDfTypeSelect();
							$o.prependTo($li.next().find('> div.x_controls:eq(0)'));
							$o.attr('name','default_type').change();
						}
						else alert(ret['message']);

						$li.find('> p.msg_call_server').hide();
						$li.next().show();
					},
					['html','error','message']
				);
			}
		});
	};

	$('a[href=#remakeCache]', this).click(function() {
		var mode = $(this).attr('data-type'),
			opt = $(this).attr('data-option') || '',
			module_srl = $(this).closest('form').find('>input[name=module_srl]').val(),
			params = {'module_srl':module_srl,'option':opt},
			cateFuncMake = 'proc' + (__XEFM_NAME__).ucfirst() + 'AdminMake' + mode.ucfirst() + 'Cache';
		exec_xml(__XEFM_NAME__, cateFuncMake, params, completeCallModuleAction);
		return false;
	});

	$('a.modalAnchor[href=#manageDeleteModule]').bind('before-open.mw',function(e)
	{
		var $frm = $('#manageDeleteModule'),
			$tr = $(this).closest('tr'),
			aVal = $(this).attr('data-val').split('|@|');

			$('.module_category', $frm).text($('.module_category', $tr).text());
			$('.module_title', $frm).text($('.module_title', $tr).text());
			$('.module_regdate', $frm).text($('.module_regdate', $tr).text());
			$('.module_mid', $frm).text(aVal[0]);
			$('input:hidden[name=module_srl]', $frm).val(aVal[1]);
	});

	$('a[href=#doBeluxeSettingCopy]').click(function()
	{
		var aVal = $(this).attr('data-val').split('|@|');
		popopen(decodeURI(current_url).setQuery('act', 'dispBeluxeAdminInsert').setQuery('is_poped','1').setQuery('m_target', aVal[0]));
		return false;
	});

	$('a[href=#dispBeluxeAdminInsert],a[href=#dispModuleAdminModuleGrantSetup]').click(function()
	{
		var aVal, isrls = new Array(),
			href = $(this).attr('href').substring(1),
			opt = href == 'dispBeluxeAdminInsert' ? 'm_targets' : 'module_srls';

		$('input[name=cart]:checked').each(function(i) {
			aVal = $(this).val().split('|@|');
			isrls[i] = opt == 'module_srls' ? aVal[1] : aVal[0];
		});

		if(isrls.length<1) return alert('Please select the items.') || false;

		popopen(decodeURI(current_url).setQuery('act', href).setQuery('is_poped','1').setQuery(opt, isrls.join(',')));
		return false;
	});

	$('select.changeLocation,select.changeColorsets').change(function() {
		location.href = decodeURI(current_url).setQuery($(this).attr('name'), $(this).val());
	});

	$('button[id=colorCodeView]').click(function() {
		var $o = $('#colorFrame input[name=color_code]').parent().hide().end().parent().show('slow').end(),
				cols = new Array();
		$('#colorFrame #color_list input[name^=color_value_]').each(function(i) { cols[i] = ($(this).val() || 'NONE').toUpperCase();});
		$o.val(cols.join(';')).focus().select();
		return false;
	});

	$('a[href=#popup_help][data-text]').click(function() {
		return alert($(this).attr('data-text').replace(/\\n/gi,"\n")) || false;
	});

	$('#addition').each(function() {
		$('select[name^=use_vote_],select[name=use_history],input[name=comment_count],input[name=enable_trackback]', this).closest('tr').css({position:'absolute',overflow:'hidden',width:'1px'});
		$('form table', this).each(function() {
			if(($(this).height() || 0) < 5) $(this).closest('form').css({position:'absolute',overflow:'hidden',width:'1px'});
		});
	});

	$('#siteMapFrame').bdxSiteMapinit();
	$('#columnFrame').bdxColumninit();
	$('#extraKeyFrame').bdxExtraKeyinit();
	$('form#insertFrame').bdxInsertinit();
});
