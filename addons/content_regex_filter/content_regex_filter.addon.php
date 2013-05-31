<?php
/**
* @brief 문서 저장 정규식 필터
* @developer phiDel (phidel@foxb.kr)
* @date 2012-08-12 ~
*/

if(!defined('__XE__')) exit();

if($called_position == 'before_module_proc' && (
	   ($addon_info->is_document == 'Y' && $this->act=='procBoardInsertDocument')
	|| ($addon_info->is_comment == 'Y' && $this->act=='procBoardInsertComment')
)){
	$filters = explode("\n", trim($addon_info->user_filter));
	if(!$filters[0]) return;

	$content = Context::get('content');

	foreach($filters as $filter)
	{
		eval('\$arr = '.$filter.';');
		$content = preg_replace($arr[0], $arr[1], $content);
	}

	Context::set('content', $content);
}

/* End of file content_regex_filter.addon.php */
/* Location: ./addons/content_regex_filter/content_regex_filter.addon.php */
