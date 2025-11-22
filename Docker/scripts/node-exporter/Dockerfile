FROM alpine:3.18
RUN apk add --no-cache prometheus-node-exporter iptables
COPY ./Docker/scripts/node-exporter/iptables-metrics.sh /etc/periodic/15min/iptables-metrics
RUN chmod +x /etc/periodic/15min/iptables-metrics
# Elimina la línea USER nobody
CMD ["/bin/sh", "-c", "crond && chown -R nobody:nobody /var/lib/node-exporter && /usr/bin/node_exporter --collector.textfile.directory=/var/lib/node-exporter"]