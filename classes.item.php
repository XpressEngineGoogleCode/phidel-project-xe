<?php
/**
* @brief BoardDX Item class
* @developer phiDel (phidel@foxb.kr)
* @date 2011-11-11 ~
*/

class BeluxeItem extends Object
{
	var $module_srl = 0;
	var $member_srl = 0;

	function beluxeItem($a_modsrl)
	{
		$this->module_srl = $a_modsrl;
		$oLogIfo = Context::get('logged_info');
		$this->member_srl = (int) $oLogIfo->member_srl;
	}

	function getAdminId()
	{
		$modsrl = $this->module_srl;

		if(!$GLOBALS['BELUXE_ADMIN_ID'][$modsrl])
		{
			$aids = array();

			$cmModule = &getModel('module');
			$out = $cmModule->getAdminId($modsrl);
			if($out)
			{
				foreach($out as $key=>$val)
				{
					$aids[$key]->member_srl = $val->member_srl;
					$aids[$key]->user_id = $val->user_id;
				}
			}

			$GLOBALS['BELUXE_ADMIN_ID'][$modsrl] = $aids;
		}

		return $GLOBALS['BELUXE_ADMIN_ID'][$modsrl];
	}

	function getSkinColorFile()
	{
		$css_file = __XEFM_CACHE__.sprintf('%s.scol.css', $this->module_srl);
		if(!file_exists($css_file))
		{
			$oModIfo = Context::get('module_info');
			require_once(__XEFM_PATH__ . 'classes.cache.php');
			BeluxeCache::skinColorCSS($this->module_srl, $oModIfo->skin);
		}

		return file_exists($css_file) ? $css_file : '';
	}

	function getBrowserInfo($agent='')
	{
		// http://php.net/manual/en/function.get-browser.php
		$known = array('msie', 'firefox', 'safari', 'webkit', 'opera', 'netscape', 'konqueror', 'gecko');

		$agent = strtolower($agent ? $agent : $_SERVER['HTTP_USER_AGENT']);
		$pattern = '#(?<browser>' . join('|', $known) . ')[/ ]+(?<version>[0-9]+(?:\.[0-9]+)?)#';

		if (!@preg_match_all($pattern, $agent, $matches)) return array('unknown' => '0');

		$i = count($matches['browser'])-1;
		return array($matches['browser'][$i] => $matches['version'][$i]);
	}

	function getIpaddress($is_crypt)
	{
		return $is_crypt ? substr(crypt(md5($_SERVER['REMOTE_ADDR']),'dx'),2) : $_SERVER['REMOTE_ADDR'];
	}

	function getPoint()
	{
		if(!$this->member_srl) return 0;
		$cmPoint = &getModel('point');
		return $cmPoint->getPoint($this->member_srl);
	}

	function getCategoryList()
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->getCategoryList($this->module_srl);
	}

	function getHistoryList($a_docsrl, $a_page = 1)
	{
		$hpageStr = sprintf('%d_hpage', $a_docsrl);
		$hpage = Context::get($hpageStr);
		if(!$hpage) $hpage = $a_page;

		$cmThis = &getModel(__XEFM_NAME__);
		$out = $cmThis->getHistoryList($a_docsrl, $hpage, 5);
		if(!$out)
		{
			$re->data = $re->page_navigation = array();
			$re->total_count = $re->total_page = 0;
		}
		else
		{
			Context::set($hpageStr, $out->page_navigation->cur_page);
			Context::set('hpage', $out->page_navigation->cur_page);
			$re->data = $out->data;
			$re->page_navigation = $out->page_navigation;
			$re->total_count = $out->total_count;
			$re->total_page = $out->total_page;
		}
		return $re;
	}

	function getNoticeList()
	{
		$cmThis = &getModel(__XEFM_NAME__);
		$out = $cmThis->getNoticeList($this->module_srl);
		return ($out&&$out->data)?$out->data:array();
	}

	function getBestList()
	{
		$cmThis = &getModel(__XEFM_NAME__);
		$out = $cmThis->getBestList($this->module_srl);
		return ($out&&$out->data)?$out->data:array();
	}

	function getBestCommentList($a_docsrl)
	{
		$cmThis = &getModel(__XEFM_NAME__);
		$out = $cmThis->getBestCommentList($a_docsrl);
		return ($out&&$out->data)?$out->data:array();
	}

	function getDocumentExtraVars($a_docsrl = 0)
	{
		$cmDocument = &getModel('document');
		if((int) $a_docsrl)
			return $cmDocument->getExtraVars($this->module_srl, $a_docsrl);
		else
			return $cmDocument->getExtraKeys($this->module_srl);
	}

	function getDocumentVotedLogs($a_docsrl)
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->getDocumentVotedLogs($a_docsrl);
	}

	function getDocumentDeclaredCount($a_docsrl)
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->getDocumentDeclaredCount($a_docsrl);
	}

	function getDocumentCountByDate($a_date = '', $a_status = array())
	{
		$cmAdmModule = &getAdminModel('document');
		return $cmAdmModule->getDocumentCountByDate($a_date, array($this->module_srl), $a_status);
	}

	function getCommentList($a_docsrl, $a_page = 0, $a_lstcnt = 50)
	{
		$cpageStr = sprintf('%d_cpage', $a_docsrl);
		$cpage = Context::get($cpageStr);
		if(!$cpage) $cpage = $a_page;

		$cmThis = &getModel(__XEFM_NAME__);
		$out = $cmThis->getCommentList($a_docsrl, (int)$cpage, $this->grant->manager, (int)$a_lstcnt);
		if(!$out)
		{
			$re->data = $re->page_navigation = array();
			$re->total_count = $re->total_page = 0;
		}
		else
		{
			Context::set($cpageStr, $out->page_navigation->cur_page);
			Context::set('cpage', $out->page_navigation->cur_page);
			$re->data = $out->data;
			$re->page_navigation = $out->page_navigation;
			$re->total_count = $out->total_count;
			$re->total_page = $out->total_page;
		}
		return $re;
	}

	function getCommentByMemberSrl($a_docsrl, $a_mbrsrl = 0)
	{
		if(!$a_mbrsrl) $a_mbrsrl = $this->member_srl;
		if(!$a_mbrsrl) return;
		$cmThis = &getModel(__XEFM_NAME__);
		$out = $cmThis->getCommentByMemberSrl($a_docsrl, $a_mbrsrl);
		return ($out&&$out->data)?$out->data:array();
	}

	function setVotePoint($a_docsrl, $a_mbrsrl, $a_point)
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->setVotePoint($a_docsrl, $a_mbrsrl, $a_point);
	}

	function setCustomStatus($a_docsrl, $a_value)
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->setCustomStatus($a_docsrl, $a_value);
	}

	function setCustomActions($a_docsrl, $a_acts)
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->setCustomActions($a_docsrl, $a_acts);
	}

	function isBlind($a_docsrl, $a_type = 'doc')
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->isBlind($a_docsrl, $a_type);
	}

	function isLocked($a_docsrl, $a_type = 'doc')
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->isLocked($a_docsrl, $a_type);
	}

	function isRestrict($a_docsrl, $a_ismbr = TRUE, $a_type = 'doc')
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->isRestrict($a_docsrl, $this->member_srl, $a_ismbr, $a_type);
	}

	function isWrote($a_docsrl, $a_ismbr = TRUE, $a_type = 'doc')
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->isWrote($a_docsrl, $this->member_srl, $a_ismbr, $a_type);
	}

	function isReaded($a_docsrl, $a_ismbr = TRUE, $a_type = 'doc')
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->isReaded($a_docsrl, $this->member_srl, $a_ismbr, $a_type);
	}

	function isVoted($a_docsrl, $a_ismbr = TRUE, $a_type = 'doc')
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->isVoted($a_docsrl, $this->member_srl, $a_ismbr, $a_type);
	}

	function isDownloaded($a_filesrl, $a_ismbr = TRUE, $a_type = 'doc')
	{
		$cmThis = &getModel(__XEFM_NAME__);
		return $cmThis->isDownloaded($a_filesrl, $this->member_srl, $a_ismbr, $a_type);
	}

	function sendMessageToMember($a_smbrsrl, $a_mbrsrl, $a_title, $a_ctent, $sender_log = TRUE)
	{
		$ccCommunication = &getController('communication');
		return $ccCommunication->sendMessage($a_smbrsrl, $a_mbrsrl, $a_title, $a_ctent, $sender_log);
	}
}

/* End of file classes.item.php */
/* Location: ./modules/beluxe/classes.item.php */