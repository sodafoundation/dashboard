/opt/dashboard # cat entrypoint.sh 
#!/bin/sh

# Copyright (c) 2018 Huawei Technologies Co., Ltd. All Rights Reserved.
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

OPENSDS_HOST_IP=${OPENSDS_HOST_IP:-127.0.0.1}
LISTEN_PORT=${LISTEN_PORT:-8088}
cat > /etc/nginx/conf.d/default.conf <<EOF
    server {
        listen $LISTEN_PORT default_server;
        listen [::]:$LISTEN_PORT default_server;
        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;
        server_name _;
        location /v3/ {
            proxy_pass http://$OPENSDS_HOST_IP/identity/v3/;
        }

        location /v1beta/ {
            proxy_pass http://$OPENSDS_HOST_IP:50040/v1beta/;
        }

        location /v1/ {
            proxy_pass http://$OPENSDS_HOST_IP:8089/v1/;
            client_max_body_size 10240m;
        }
    }
EOF

/usr/sbin/nginx -g "daemon off;"
