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
$g_crypto_master_salt = 'APUNJU_c3f8a9d2e7b6f1a4c8d5e2f9b3a7c1d6e4f8a2b5c9d3e7f1a6b8c2d9e5f3a7b1c4d8e2f6a9b3c7d1e5f8a2b4c6d9e3f7a1b5c8d2e6f9a3b7c1d5e8f2a4b6c9d3e7f1a5b8c2d6e9f3a7b1c4d8e2f5a9b3c6d1e7f8a2b4c9d3e6f1a5b7c8d2e9f3a6b1c4d7e8f2a5b9c3d6e1f7a8b2c4d9e3f5a1b6c7d8e2f9a3b5c1d4e6f7a8b2c9d3e5f1a4b6c7d8e2f9a3b5c1d6e7f8a2b4c9d3e5f1a6b7c8d2e9f3a4b5c1d6e7f8a2b9c3d4e5f1a6b7c8d2e9f3a4b5c1d6e7f8a2b9c3d4e5f1a6b7c8d2';

# ===== REGISTRO Y ACCESO =====
$g_allow_signup = ON;
$g_allow_anonymous_login = OFF;
$g_anonymous_account = '';

# ===== SESIONES Y VALIDACIÓN =====
$g_session_validation = ON;
$g_form_security_validation = ON;


# ===== CONFIGURACIÓN DE EMAIL =====
$g_phpMailer_method = PHPMAILER_METHOD_SMTP;
$g_smtp_host = 'smtp.gmail.com';
$g_smtp_connection_mode = 'tls';
$g_smtp_port = 587;
$g_smtp_username = 'elegampihia@gmail.com';
$g_smtp_password = 'oelp eeet wybl ngsb';
$g_administrator_email = 'elegampihia@gmail.com';
$g_webmaster_email = 'elegampihia@gmail.com';
$g_from_email = 'elegampihia@gmail.com';
$g_return_path_email = 'elegampihia@gmail.com';
$g_enable_email_notification = ON;
$g_email_notifications_verbose = ON;
$g_log_level = LOG_EMAIL | LOG_EMAIL_RECIPIENT | LOG_FILTERING | LOG_AJAX;
$g_log_destination = "file:/var/log/bugtracker.log";

# ===== LOGS =====
$g_log_level = LOG_EMAIL | LOG_EMAIL_RECIPIENT;
$g_log_destination = 'file:/tmp/mantis.log';

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

# ===== PERSONALIZACIÓN =====
$g_window_title = 'APUNJU - Bug Tracker';
$g_page_title = 'Sistema de Gestión de Incidencias - APUNJU';