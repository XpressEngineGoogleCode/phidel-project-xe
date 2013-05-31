<?php
/**
* @brief Board DX
* @developer phiDel (phidel@foxb.kr)
* @date 2011-11-11 ~
*/

define('__XEFM_NAME__', 'beluxe');
define('__XEFM_PATH__', './modules/'.__XEFM_NAME__.'/');
define('__XEFM_CACHE__', './files/cache/document_category/');
define('__XEFM_DXCFG__', './files/config/beluxe/');
define('__XEFM_ORDER__', 'list_order,update_order,regdate,voted_count,readed_count,comment_count,title');

if(file_exists(__XEFM_PATH__ . 'classes.item.php')) require_once(__XEFM_PATH__ . 'classes.item.php');
if(file_exists(__XEFM_PATH__ . 'classes.entry.php')) require_once(__XEFM_PATH__.'classes.entry.php');

class beluxe extends ModuleObject
{

	/* @brief Install the module */
	function moduleInstall()
	{
		if(file_exists(__XEFM_PATH__ . 'schemas/file_downloaded_log.xml'))
		{
			$ccModule = &getController('module');
			$ccModule->insertTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerBeforeDownloadFile', 'before');
			$ccModule->insertTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerDownloadFile', 'after');
		}

		return new Object();
	}

	/* @brief Check the module */
	function checkUpdate()
	{
		if(file_exists(__XEFM_PATH__ . 'schemas/file_downloaded_log.xml'))
		{
			$cmModule = &getModel('module');
			if(!$cmModule->getTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerBeforeDownloadFile', 'before')) return TRUE;
			if(!$cmModule->getTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerDownloadFile', 'after')) return TRUE;
		}

		return FALSE;
	}

	/* @brief Updaet the module */
	function moduleUpdate()
	{
		if(file_exists(__XEFM_PATH__ . 'schemas/file_downloaded_log.xml'))
		{
			$cmModule = &getModel('module');
			$ccModule = &getController('module');
			if(!$cmModule->getTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerBeforeDownloadFile', 'before'))
				$ccModule->insertTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerBeforeDownloadFile', 'before');
			if(!$cmModule->getTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerDownloadFile', 'after'))
				$ccModule->insertTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerDownloadFile', 'after');
		}

		return new Object(0, 'success_updated');
	}

	/* @brief Uninstall the module */
	function moduleUninstall()
	{
		if(file_exists(__XEFM_PATH__ . 'schemas/file_downloaded_log.xml'))
		{
			$ccModule = &getController('module');
			$ccModule->deleteTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerBeforeDownloadFile', 'before');
			$ccModule->deleteTrigger('file.downloadFile', 'beluxe', 'controller', 'triggerDownloadFile', 'after');
		}

		$this->recompileCache();
		return new Object();
	}

	/* @brief create the cache */
	function recompileCache()
	{
		if(is_dir(__XEFM_CACHE__))
		{
			$dir = dir(__XEFM_CACHE__);

			while($tmp = $dir->read())
			{
				if ($tmp != '.' && $tmp != '..' && !is_dir(__XEFM_CACHE__ . $tmp))
				{
					if (preg_match ('/' . $module_srl . '\..+/', $tmp)) @unlink(__XEFM_CACHE__ . $tmp);
				}
			}

			$dir->close();
		}
	}

}

/* End of file beluxe.class.php */
/* Location: ./modules/beluxe/beluxe.class.php */