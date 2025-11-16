<?php
# MantisBT - Configuración para proyecto APUNJU

# ===== CONEXIÓN A BASE DE DATOS (Cluster Galera) =====
$g_hostname = 'haproxy';  # Balanceador de carga
$g_db_type = 'mysqli';
$g_database_name = 'bugtracker';
$g_db_username = 'mantisbt';
$g_db_password = 'mantisbt_password';
$g_db_port = 3306;

# ===== CONFIGURACIÓN REGIONAL =====
$g_default_timezone = 'America/Argentina/Jujuy';
$g_default_language = 'spanish';

# ===== SEGURIDAD =====
$g_crypto_master_salt = 'APUNJU_' . md5(time());

# ===== REGISTRO Y ACCESO =====
$g_allow_signup = ON;  # ← Permitir que el equipo se registre
$g_allow_anonymous_login = OFF;
$g_anonymous_account = '';

# ===== CONFIGURACIÓN DE EMAIL =====
$g_phpMailer_method = PHPMAILER_METHOD_SMTP;
$g_smtp_host = 'smtp.gmail.com';
$g_smtp_port = 587;
$g_smtp_connection_mode = 'tls';
$g_smtp_username = 'newellsito@gmail.com';
$g_smtp_password = 'ajlb djqv jpde bnbv';
$g_administrator_email = 'newellsito@gmail.com';
$g_webmaster_email = 'newellsito@gmail.com';
$g_from_email = 'newellsito@gmail.com';
$g_from_name = 'APUNJU Bug Tracker';
$g_return_path_email = 'newellsito@gmail.com';
$g_email_notifications_enabled = ON;

# ===== ARCHIVOS ADJUNTOS =====
$g_allow_file_upload = ON;
$g_file_upload_method = DISK;
$g_absolute_path_default_upload_folder = '/var/www/html/mantisbt/uploads/';
$g_max_file_size = 10485760;  # 10MB
$g_allowed_files = 'png,gif,jpg,jpeg,pdf,txt,doc,docx,xls,xlsx,ppt,pptx,zip,rar,sql,log,json,xml,csv';

# ===== URL DEL SITIO =====
$g_path = 'http://localhost:8989/';
$g_short_path = '/';

# ===== PERMISOS Y CARACTERÍSTICAS =====
$g_enable_project_documentation = ON;
$g_view_summary_threshold = VIEWER;
$g_due_date_view_threshold = VIEWER;
$g_admin_site_threshold = ADMINISTRATOR;

# ===== SESIONES =====
$g_session_validation = ON;
$g_form_security_validation = ON;

# ===== LOGS =====
$g_log_level = LOG_EMAIL | LOG_EMAIL_RECIPIENT;
$g_log_destination = 'file:/tmp/mantis.log';

# ===== PERSONALIZACIÓN =====
$g_window_title = 'APUNJU - Bug Tracker';
$g_page_title = 'Sistema de Gestión de Incidencias - APUNJU';