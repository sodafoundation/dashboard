#!/bin/sh

# Copyright 2021 The SODA Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

OPENSDS_HOTPOT_URL=${OPENSDS_HOTPOT_URL:-http://127.0.0.1:50040}
OPENSDS_ORCHESTRATION_URL=${OPENSDS_ORCHESTRATION_URL:-http://127.0.0.1:5000}
SODA_DELFIN_URL=${SODA_DELFIN_URL:-http://127.0.0.1:8190}
OPENSDS_GELATO_URL=${OPENSDS_GELATO_URL:-http://127.0.0.1:8089}
OPENSDS_S3_URL=${OPENSDS_S3_URL:-http://127.0.0.1:8090}
OPENSDS_AUTH_URL=${OPENSDS_AUTH_URL:-http://127.0.0.1/identity}
SODA_ALERTMANAGER_URL=${SODA_ALERTMANAGER_URL:-http://127.0.0.1:9093}

OPENSDS_HOTPOT_API_VERSION=${OPENSDS_HOTPOT_API_VERSION:-v1beta}
OPENSDS_ORCHESTRATION_API_VERSION=${OPENSDS_ORCHESTRATION_API_VERSION:-orch}
SODA_DELFIN_API_LOCATION=${SODA_DELFIN_API_LOCATION:-resource-monitor}
SODA_DELFIN_API_VERSION=${SODA_DELFIN_API_VERSION:-v1}
SODA_ALERTMANAGER_API_LOCATION=${SODA_ALERTMANAGER_API_LOCATION:-alertmanager}
SODA_ALERTMANAGER_API_VERSION=${SODA_ALERTMANAGER_API_VERSION:-api/v1}
OPENSDS_GELATO_API_VERSION=${OPENSDS_GELATO_API_VERSION:-v1}
OPENSDS_S3_API_VERSION=${OPENSDS_S3_API_VERSION:-s3}
OPENSDS_AUTH_API_VERSION=${OPENSDS_AUTH_API_VERSION:-v3}

LISTEN_PORT=${LISTEN_PORT:-8088}
cat > /etc/nginx/conf.d/default.conf <<EOF
    server {
        listen ${LISTEN_PORT} default_server;
        listen [::]:${LISTEN_PORT} default_server;
        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;
        server_name _;
        location /${OPENSDS_AUTH_API_VERSION}/ {
            proxy_pass ${OPENSDS_AUTH_URL}/${OPENSDS_AUTH_API_VERSION}/;
        }

        location /${OPENSDS_HOTPOT_API_VERSION}/ {
            proxy_pass ${OPENSDS_HOTPOT_URL}/${OPENSDS_HOTPOT_API_VERSION}/;
        }

        location /${OPENSDS_ORCHESTRATION_API_VERSION}/ {
            proxy_pass ${OPENSDS_ORCHESTRATION_URL}/${OPENSDS_HOTPOT_API_VERSION}/;
        }

         location /${SODA_DELFIN_API_LOCATION}/ {
            proxy_pass ${SODA_DELFIN_URL}/${SODA_DELFIN_API_VERSION}/;
        }
        
         location /${OPENSDS_GELATO_API_VERSION}/ {
            proxy_pass ${OPENSDS_GELATO_URL}/${OPENSDS_GELATO_API_VERSION}/;
            client_max_body_size 10240m;
        }

        location /${OPENSDS_S3_API_VERSION}/ {
            proxy_pass ${OPENSDS_S3_URL}/;
            client_max_body_size 10240m;
        }

        location /${SODA_ALERTMANAGER_API_LOCATION}/ {
            proxy_pass ${SODA_ALERTMANAGER_URL}/${SODA_ALERTMANAGER_API_VERSION}/;
        }
    }
EOF

# print some log to stdin
echo "Service Start Time $(date)"
echo "Configuration /etc/nginx/conf.d/default.conf"
cat /etc/nginx/conf.d/default.conf

echo "Starting application..."
echo "OPENSDS_S3_HOST = ${OPENSDS_S3_HOST}"
echo "OPENSDS_S3_PORT = ${OPENSDS_S3_PORT}"
echo "SODA_PROMETHEUS_PORT = ${SODA_PROMETHEUS_PORT}"
echo "SODA_ALERTMANAGER_PORT = ${SODA_ALERTMANAGER_PORT}"
echo "SODA_GRAFANA_PORT = ${SODA_GRAFANA_PORT}"
echo "STORAGE_SERVICE_PLAN_ENABLED = ${STORAGE_SERVICE_PLAN_ENABLED}"
echo "{\"hostIP\": \"$OPENSDS_S3_HOST\",\"hostPort\": \"$OPENSDS_S3_PORT\",\"prometheusPort\": \"$SODA_PROMETHEUS_PORT\",\"alertmanagerPort\": \"$SODA_ALERTMANAGER_PORT\",\"grafanaPort\": \"$SODA_GRAFANA_PORT\",\"servicePlansEnabled\": \"$STORAGE_SERVICE_PLAN_ENABLED\"}" >/var/www/html/assets/data/runtime.json

# start nginx service
/usr/sbin/nginx -g "daemon off;"

