jQuery(function($)
{
	$('#siWrt select.scWcateList').change(function(){
		var v = $(this).val(), k = $(this).data('key'),
			$d = $('select.scWcateList[data-key='+k+']'),
			$s = $('select.scWcateList[data-key='+v+']');
		$(this).data('key', v);
		$('input:hidden[name=category_srl]').val(v);
		$('select.scWcateList[data-key='+$d.data('key')+']').hide('slow');
		$d.hide('slow');
		if($s.find('>option').length) $s.change().show('slow');
	});
	$('#siWrt input:hidden[name=category_srl]').each(function(){
		var v = $(this).val(), i = 0, $s;
		if(v != undefined && v > 0){
			while ($s = $('select.scWcateList option[value='+v+']').closest('select'))
			{
				$s.data('key', v).val(v);
				v = $s.show().attr('data-key');
				if(v == undefined || !v || (i++ > 9)) break;
			}
			$s.change();
		}else{
			$('select.scWcateList:eq(0)').change();
		}
	});
	$('#insert_filelink a[href=#insert_filelink]').click(function(){
		var $p = $(this).closest('#insert_filelink').find('> input'),
			v = $p.val(), q = $(this).attr('data-seq'), r = $(this).attr('data-srl');
		if(v == undefined || !v){
			alert('Please enter the file url.\nvirtual type example: http://... #.mov');
			$p.focus();
			return false;
		}
		exec_xml(
			'Beluxe','procBeluxeInsertFileLink',
			{ 'mid':current_mid,'sequence_srl':q,'document_srl':r,'filelink_url':v },
			function(ret){
				reloadFileList(uploaderSettings[ret.sequence_srl]);
			}, ['error','message','sequence_srl']
		);
		return false;
	});
	$('form input[type=text][name=exfield_start_point]').each(function(){
		var v = xe.getApp('Validator')[0];
		if (!v) return false;
		v.cast('ADD_RULE', ['auction_number', /^[1-9][0-9]*$/]);
		v.cast('ADD_RULE', ['phone_number', /[0-9\-]+$/]);
		v.cast("ADD_MESSAGE", ["invalid_auction_number",__XEFM_LANG__['invalid_auction_number']]);
		v.cast("ADD_MESSAGE", ["invalid_phone_number",__XEFM_LANG__['invalid_phone_number']]);
	});
});