FROM ubuntu:22.04

# ============================================================================
# CONTENEDOR DE OPTIMIZACIÓN CON PERCONA TOOLKIT
# ============================================================================
# Percona Toolkit: Suite de 30+ herramientas para MySQL/MariaDB
# - pt-query-digest: Analiza slow query log
# - pt-table-checksum: Verifica consistencia en Galera Cluster
# - pt-duplicate-key-checker: Encuentra índices redundantes
# - pt-online-schema-change: ALTER TABLE sin downtime
# - pt-index-usage: Detecta índices no usados
# ============================================================================

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias básicas (incluyendo dependencias de Percona Toolkit)
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    perl \
    libdbi-perl \
    libdbd-mysql-perl \
    libterm-readkey-perl \
    libio-socket-ssl-perl \
    mysql-client \
    git \
    python3 \
    python3-pip \
    sysbench \
    htop \
    iotop \
    vim \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Instalar Percona Toolkit (herramienta principal)
RUN wget https://downloads.percona.com/downloads/percona-toolkit/3.5.7/binary/debian/jammy/x86_64/percona-toolkit_3.5.7-1.jammy_amd64.deb \
    && apt-get update \
    && apt-get install -f -y \
    && dpkg -i percona-toolkit_3.5.7-1.jammy_amd64.deb \
    && rm percona-toolkit_3.5.7-1.jammy_amd64.deb \
    && apt-get clean

# Crear directorio de trabajo
WORKDIR /optimization

# Copiar scripts de optimización
COPY scripts/*.sh /scripts/
RUN chmod +x /scripts/*.sh

# Crear directorio de reportes
RUN mkdir -p /optimization/reports

CMD ["/bin/bash"]
