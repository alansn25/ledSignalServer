<?php
@ini_set('zlib.output_compression', 'Off');
@ini_set('output_buffering', 'Off');
@ini_set('output_handler', '');
//@apache_setenv('no-gzip', 1);

   $ver  = $_GET['version'];
   $file = $_GET['filename'];
   $act  = $_GET['action'];
   $mac_addr  = $_GET['mac'];

   if (($ver != NULL) && ($file != NULL) && ($act == "download_rom") && ($mac_addr != NULL)){
      $dir = sprintf("%s/",$ver);
      	 $folder_file = $dir . $file;
      if (file_exists($folder_file)) {
      	 header('Content-Description: File Transfer');
         header('Content-Type: application/octet-stream');
         header('Content-Disposition: attachment; filename="'.basename($folder_file).'"');
         header('Expires: 0');
         header('Cache-Control: must-revalidate');
         header('Pragma: public');
         header('Content-Length: ' . filesize($folder_file));
         readfile($folder_file);
         exit;
      }
   }
?> 