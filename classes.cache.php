<?php
/**
* @brief BoardDX Cache class
* @developer phiDel (phidel@foxb.kr)
* @date 2011-11-11 ~
*/

class BeluxeCache
{
	/* @brief Create a cache of column config */
	function columnConfigList($a_modsrl)
	{
		// 저장된 목록 설정값을 구하고 없으면 기본 값으로 설정
		$cmModule = &getModel('module');
		$lst_cfg = (array) $cmModule->getModulePartConfig('beluxe', $a_modsrl);

		$vt_vars = array(
			'no'=>array('1','','Y','N','N'),
			'category_srl'=>array('2','','N','N','N'),
			'title'=>array('3','','Y','N','Y'),
			'nick_name'=>array('4','','Y','N','Y'),
			'user_name'=>array('5'),
			'user_id'=>array('6'),
			'email_address'=>array('7'),
			'homepage'=>array('8'),
			'ipaddress'=>array('9'),
			'voted_count'=>array('10'),
			'blamed_count'=>array('11'),
			'readed_count'=>array('12','','Y','Y','N'),
			'regdate'=>array('13','','Y','Y','Y'),
			'last_update'=>array('14'),
			'last_updater'=>array('15'),
			'custom_status'=>array('16'),
			'content'=>array('17','','N','N','Y'),
			'comment'=>array('18','','N','N','Y'),
			'thumbnail'=>array('19'),
			'tag'=>array('20')
		);

		$args->module_srl = $a_modsrl;
		$args->sort_index = 'var_idx';
		$args->order = 'asc';
		$out = executeQueryArray('document.getDocumentExtraKeys', $args);
		if($out->toBool() && count($out->data)) $vt_vars = array_merge($vt_vars, $out->data);

		foreach($vt_vars as $key => $val)
		{
			if(gettype($val) == 'object')
			{
				$kname = 'extra_vars' . $val->idx;
				$item = $lst_cfg[$kname];

				if(is_array($item))
				{
					$aSort[$kname] = (9000 - $item[0]) * -1;
					$val->color = $item[1];
					$val->display = $item[2];
					$val->sort = $item[3];
					$val->search = $item[4];
				}
				else
				{
					$aSort[$kname] = 9000 + $key;
				}

				$ext_vars[$kname] = array(
					$a_modsrl, $val->idx, $val->name, $val->type, $val->default, $val->desc,
					$val->is_required, $val->search, $val->value, $val->eid, $val->color, $val->display, $val->sort
				);
			}
			else
			{
				$item = $lst_cfg[$key];

				if(is_array($item))
				{
					$aSort[$key] = (9000 - $item[0]) * -1;
					$val = $item;
				}
				else
				{
					$aSort[$key] = count($aSort) + 1;
				}

				$ext_vars[$key] = array(
					$a_modsrl, -1, 'Context::getLang(\'' . $key . '\')', 'text', 'N', '\'\'',
					'N', (string) $val[4], '', $key, (string) $val[1], (string) $val[2], (string) $val[3]
				);
			}
		}

		array_multisort($aSort, $ext_vars);

		// Get module information (to obtain mid)
		$cmModule = &getModel('module');
		$oModIfo = $cmModule->getModuleInfoByModuleSrl($a_modsrl, array('mid', 'site_srl'));
		$mid = $oModIfo->mid;

		$cmAdmModule = &getAdminModel('module');
		$site_srl = $oModIfo->site_srl;

		$php_buff = '$lang_type = Context::getLangType(); $column_info = array(); ';

		foreach($ext_vars as $key=>$val)
		{
			if($val[1] > 0)
			{
				$langs = $cmAdmModule->getLangCode($site_srl, $val[2]);
				if(count($langs)) foreach($langs as $lakey => $lang) $php_buff .= sprintf('$_titles[%d]["%s"] = "%s"; ', $val[1], $lakey, str_replace('"', '\\"', htmlspecialchars($lang)));
				$langs = $cmAdmModule->getLangCode($site_srl, $val[5]);
				if(count($langs)) foreach($langs as $lakey => $lang) $php_buff .= sprintf('$_descriptions[%d]["%s"] = "%s"; ', $val[1], $lakey, str_replace('"', '\\"', htmlspecialchars($lang)));
				$val[2] = '$_titles[' . $val[1] . '][$lang_type]';
				$val[5] = '$_descriptions[' . $val[1] . '][$lang_type]';
			}

			$php_buff .=
				'$column_info[\''.$key.'\']='.
				'new ExtraItem('.
					$val[0].','.
					$val[1].','.
					$val[2].','.
					'\''.$val[3].'\','.
					'\''.$val[4].'\','.
					$val[5].','.
					'\''.$val[6].'\','.
					'\''.$val[7].'\','.
					'"'.str_replace('"','\\"',htmlspecialchars($val[8])).'",'.
					'\''.$val[9].'\''.
				');'.
				'$column_info[\''.$key.'\']->color=\''.$val[10].'\';'.
				'$column_info[\''.$key.'\']->display=\''.$val[11].'\';'.
				'$column_info[\''.$key.'\']->sort=\''.$val[12].'\'; '
			;
		}

		if(!is_dir(__XEFM_CACHE__)) FileHandler::makeDir(__XEFM_CACHE__);
		$php_file = __XEFM_CACHE__.sprintf('%s.clm.php', $a_modsrl);
		FileHandler::writeFile($php_file, sprintf('<?php if(!defined("__XE__"))exit; %s ?>', $php_buff));
	}

	/* @brief Create a cache of column config */
	function skinColorCSS($a_modsrl, $a_skin)
	{
		$tmp = __XEFM_DXCFG__.sprintf('%s.scol.php', $a_modsrl);
		if(!file_exists($tmp))
		{
			FileHandler::removeFile(__XEFM_CACHE__.sprintf('%s.scol.css', $a_modsrl));
			return '';
		}

		$cmAdmThis = &getAdminModel(__XEFM_NAME__);
		$oColor = $cmAdmThis->getSkinColorList($a_modsrl, -1);

		$css_buff = '@charset "utf-8";' . "\n";

		foreach($oColor->colors as $color)
		{
			foreach($color->values as $col)
			{
				$select = $col->select;
				if(!$select) continue;

				$t_name = explode(';', $col->name);
				$t_color = explode(';', $col->color);
				$t_cnt = 0;
				$t_buff = '';

				foreach($t_name as $tv)
				{
					$ta = array();
					$is_set = false;
					$tc = substr_count($tv, '%');

					for ($i=0; $i < $tc; $i++)
					{
						$tt = $t_color[$t_cnt++];
						$ta[] = $tt;
						$is_set = $is_set || $tt;
					}

					if($is_set) $t_buff .= vsprintf($tv, $ta) . ';';
				}

				foreach($col->group as $grp)
				{
					foreach($grp->items as $gem)
					{
						$t_select = $gem->select;
						if($t_select) $t_buff .= '}' . "\n" . $t_select . '{';

						$t_name = explode(';', $gem->name);
						$t_color = explode(';', $gem->color);
						$t_cnt = 0;

						foreach($t_name as $tv)
						{
							$ta = array();
							$is_set = false;
							$tc = substr_count($tv, '%');

							for ($i=0; $i < $tc; $i++)
							{
								$tt = $t_color[$t_cnt++];
								$ta[] = $tt;
								$is_set = $is_set || $tt;
							}

							if($is_set) $t_buff .= vsprintf($tv, $ta) . ';';
						}
					}
				}

				if($t_buff) $css_buff .= $select . '{' . $t_buff . '}' . "\n";
			}
		}

		if(!is_dir(__XEFM_CACHE__)) FileHandler::makeDir(__XEFM_CACHE__);
		$css_file = __XEFM_CACHE__.sprintf('%s.scol.css', $a_modsrl);
		FileHandler::writeFile($css_file, $css_buff);
	}
}

/* End of file classes.cache.php */
/* Location: ./modules/beluxe/classes.cache.php */