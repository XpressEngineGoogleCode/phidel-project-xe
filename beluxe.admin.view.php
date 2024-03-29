<?php
/**
* @brief BoardDX Admin View class
* @developer phiDel (phidel@foxb.kr)
* @date 2011-11-11 ~
*/

class beluxeAdminView extends beluxe
{

	/******************************************************************/
	/*********** @initialization							***********/

	function init()
	{
		$cmModule = &getModel('module');

		// 관리자용 언어팩은 따로 읽기
		Context::loadLang($this->module_path.'lang/admin');

		// module_srl이 있으면 미리 체크하여 존재하는 모듈이면 module_info 세팅
		$mod_srl = Context::get('module_srl');
		if(!$mod_srl && $this->module_srl)
		{
			$mod_srl = $this->module_srl;
			Context::set('module_srl', $mod_srl);
		}

		// module_srl이 넘어오면 해당 모듈의 정보를 미리 구해 놓음
		if($mod_srl)
		{
			// module model 객체 생성
			$oModIfo = $cmModule->getModuleInfoByModuleSrl($mod_srl);
			if(!$oModIfo)
			{
				$this->act = 'list';
			}
			else
			{
				ModuleModel::syncModuleToSite($oModIfo);
				$this->module_info = $oModIfo;
				if(!$this->module_info->skin) $this->module_info->skin = 'default';
				Context::set('module_info', $this->module_info);
			}
		}

		$this->module_srl = $oModIfo->module_srl;
		Context::set('module_srl', $this->module_srl);

		// 정렬 옵션을 세팅
		$order = explode(',', __XEFM_ORDER__);
		foreach($order as $key) $order_target[$key] = Context::getLang($key);
		$order_target['list_order'] = Context::getLang('document_srl');
		$order_target['update_order'] = Context::getLang('last_update');
		Context::set('order_target', $order_target);

		// 모듈 카테고리 목록을 구함
		$module_category = $cmModule->getModuleCategories();
		Context::set('module_category', $module_category);

		// 관리용 템플릿 경로 지정
		$this->setTemplatePath($this->module_path.'tpl/');

		if(Context::get('is_poped'))
		{
			$this->setLayoutPath('./common/tpl');
			$this->setLayoutFile('popup_layout');
		}
	}

	/******************************************************************/
	/*********** @private function							***********/

	/******************************************************************/
	/*********** @public function							***********/

	/* @brief Display a content */
	function dispBeluxeAdminContent()
	{
		$args->page = 1;
		$args->list_count = 5;
		$args->order_type = 'desc';
		if($this->module_srl) $args->module_srl = $this->module_srl;

		$args->sort_index = 'document_declared.declared_count';
		$out = executeQuery('beluxe.getDocumentDeclaredList', $args);
		Context::set('document_list', $out->data);

		$args->sort_index = 'comment_declared.declared_count';
		$out = executeQuery('beluxe.getCommentDeclaredList', $args);
		Context::set('comment_list', $out->data);

		$this->setTemplateFile('index');
	}

	/* @brief Display a list of beluxe */
	function dispBeluxeAdminList()
	{
		$cmAdmThis = &getAdminModel(__XEFM_NAME__);
		$out = $cmAdmThis->getBeluxeList();

		Context::set('this_module_list', $out->data);
		Context::set('total_count', $out->total_count);
		Context::set('total_page', $out->total_page);
		Context::set('page', $out->page);
		Context::set('page_navigation', $out->page_navigation);

		$this->setTemplateFile('list');
	}

	/* @brief Display an insert info of beluxe */
	function dispBeluxeAdminInsert()
	{
		// 스킨 목록을 구해옴
		$cmModule = &getModel('module');
		$skin_lst = $cmModule->getSkins($this->module_path);
		Context::set('skin_list',$skin_lst);

		// 레이아웃 목록을 구해옴
		$cmLayout = &getModel('layout');
		$layout_lst = $cmLayout->getLayoutList();
		Context::set('layout_list', $layout_lst);

		$mobile_llst = $cmLayout->getLayoutList(0,'M');
		Context::set('mlayout_list', $mobile_llst);

		// get document status list
		$cmDocument = &getModel('document');
		$stat_lst = $cmDocument->getStatusNameList();
		Context::set('document_status_list', $stat_lst);

		$m_target = Context::get('m_target');
		$m_targets = Context::get('m_targets');

		// 모듈 타겟이 넘어오면 대상 정보를 바꿈
		if($m_target || $m_targets)
		{
			if($m_target)
			{
				$m_target = explode(',', $m_target);
				$m_target = $m_target[0];

				$site_srl = Context::get('site_srl');
				$oModIfo = $cmModule->getModuleInfoByMid($m_target, $site_srl);
				if($oModIfo)
				{
					ModuleModel::syncModuleToSite($oModIfo);
				}
				else return $this->stop($m_target);

				Context::set('m_copy_target', $m_target);
			}
			else
			{
				Context::set('m_allset_targets', $m_targets);
			}

			Context::set('module_info', $oModIfo);
		}
		else
		{
			$cmAdmThis = &getAdminModel(__XEFM_NAME__);
			$tmp = $cmAdmThis->getTypeList($this->module_srl ? $this->module_info->skin : 'default');
			Context::set('default_type_list', $tmp);

			if(is_string($this->module_info->backup_options))
			{
				$tmp = unserialize($this->module_info->backup_options);
				$compulsory = array();
				foreach($tmp as $key=>$val) $compulsory[$key] = $val;
				Context::set('compulsory_options', $compulsory);
			}

			if(is_string($_SESSION['BELUXE_MODULE_BACKUP_OPTIONS']))
			{
				$tmp = unserialize($_SESSION['BELUXE_MODULE_BACKUP_OPTIONS']);
				$compulsory = array();
				foreach($tmp as $key=>$val) $compulsory[$key] = $val;
				Context::set('module_backup_options', $compulsory);
				unset($_SESSION['BELUXE_MODULE_BACKUP_OPTIONS']);
			}

			if($this->module_srl)
			{
				$doc_cfg = $cmModule->getModulePartConfig('document', $this->module_srl);
				$part_config->use_history = $doc_cfg->use_history;
				$part_config->use_vote_up = $doc_cfg->use_vote_up;
				$part_config->use_vote_down = $doc_cfg->use_vote_down;
				$doc_cfg = $cmModule->getModulePartConfig('comment', $this->module_srl);
				$part_config->use_c_vote_up = $doc_cfg->use_vote_up;
				$part_config->use_c_vote_down = $doc_cfg->use_vote_down;
				$doc_cfg = $cmModule->getModulePartConfig('trackback', $this->module_srl);
				$part_config->enable_trackback = $doc_cfg->enable_trackback != 'N' ? 'Y' : 'N';
				Context::set('part_config', $part_config);
			}
		}

		$this->setTemplateFile('insert');
	}

	/* @brief Display a info of beluxe */
	function dispBeluxeAdminModuleInfo()
	{
		$this->dispBeluxeAdminInsert();
	}

	/* @brief Display a category info */
	function dispBeluxeAdminCategoryInfo()
	{
		$cmAdmThis = &getAdminModel(__XEFM_NAME__);
		$out = $cmAdmThis->getCategoryList($this->module_srl);
		Context::set('menu', $out->data);

		// Get a list of member groups
		$cmMember = &getModel('member');
		$gru_lst = $cmMember->getGroups($this->module_info->site_srl);
		Context::set('group_list', $gru_lst);

		$types = $cmAdmThis->getTypeList($this->module_info->skin);
		Context::set('type_list', $types);

		Context::loadJavascriptPlugin('ui.colorpicker');
		$this->setTemplateFile('category');
	}

	/* @brief Display a skin info */
	function dispBeluxeAdminSkinInfo()
	{
		$cmModule = &getModel('module');
		$skin_info = $cmModule->loadSkinInfo($this->module_path, $this->module_info->skin);
		$skin_vars = $cmModule->getModuleSkinVars($this->module_srl);

		Context::set('mid', $module_info->mid);
		Context::set('skin_info', $skin_info);
		Context::set('skin_vars', $skin_vars);

		$this->setTemplateFile('skin');
	}

	/* @brief Display a skin color */
	function dispBeluxeAdminSkinColor()
	{
		$a_set = Context::get('custom_colorset');
		if(!$a_set) $a_set = file_exists(__XEFM_DXCFG__.sprintf('%s.scol.php', $this->module_srl)) ? -1 : 0;
		 Context::set('custom_colorset', $a_set);

		$cmAdmThis = &getAdminModel(__XEFM_NAME__);
		$colors = $cmAdmThis->getSkinColorList($this->module_srl, $a_set, true);
		Context::set('color_list', $colors->colors);
		Context::set('color_samples', $colors->samples);

		Context::loadJavascriptPlugin('ui.colorpicker');
		$this->setTemplateFile('color');
	}

	/* @brief Display a grant info */
	function dispBeluxeAdminGrantInfo()
	{
		$cmAdmModule = &getAdminModel('module');
		$grant_content = $cmAdmModule->getModuleGrantHTML($this->module_srl, $this->xml_info->grant);
		Context::set('grant_content', $grant_content);

		$this->setTemplateFile('grant');
	}

	/* @brief Setting a addition */
	function dispBeluxeAdminAdditionSetting()
	{
		// content는 다른 모듈에서 call by reference로 받아오기에 미리 변수 선언만 해 놓음
		$content = '';

		// 추가 설정을 위한 트리거 호출
		// 게시판 모듈이지만 차후 다른 모듈에서의 사용도 고려하여 trigger 이름을 공용으로 사용할 수 있도록 하였음
		$out = ModuleHandler::triggerCall('module.dispAdditionSetup', 'before', $content);
		$out = ModuleHandler::triggerCall('module.dispAdditionSetup', 'after', $content);
		Context::set('setup_content', $content);

		// 템플릿 파일 지정
		$this->setTemplateFile('addition');
	}

	/* @brief Setting a list column */
	function dispBeluxeAdminColumnInfo()
	{
		// 대상 항목을 구함
		$cmThis = &getModel(__XEFM_NAME__);
		$lst_cfg = $cmThis->getColumnInfo($this->module_srl);

		// 설정 항목 추출 (설정항목이 없을 경우 기본 값을 세팅)
		Context::set('column_info', $lst_cfg);
		Context::loadJavascriptPlugin('ui.colorpicker');

		$this->setTemplateFile('column');
	}

	/* @brief Setting a extra vars */
	function dispBeluxeAdminExtraKeys()
	{
		$cmDocument = &getModel('document');
		// Bringing existing extra_keys
		$extra_keys = $cmDocument->getExtraKeys($this->module_srl);
		Context::set('extra_keys', $extra_keys);

		$this->setTemplateFile('extra.keys');
	}

	/******************************************************************/

}

/* End of file beluxe.admin.view.php */
/* Location: ./modules/beluxe/beluxe.admin.view.php */