# !/usr/bin/env bash

# Copyright 2022 The SODA Authors.
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
#

keystone_credentials () {
    export OS_AUTH_URL="http://${HOST_IP}/identity"
    export OS_USERNAME=admin
    export OS_PASSWORD=opensds@123
    export OS_PROJECT_NAME=admin
    export OS_PROJECT_DOMAIN_NAME=Default
    export OS_USER_DOMAIN_NAME=Default
    export OS_IDENTITY_API_VERSION=3
    echo -e "\033[3;32m Keystone credentials have been setup... \033[m"
}

wait_for_keystone () {
    local count=0
    local interval=${1:-10}
    local times=${2:-30}

    while true
    do
        # get a token to check if keystone is working correctly or not.
        # keystone credentials such as OS_USERNAME must be set before.
        python3 ./ministone.py token_issue  > /dev/null
        if [ "$?" == "0" ]; then
            return
        fi
        count=`expr ${count} \+ 1`
        if [ ${count} -ge ${times} ]; then
            echo -e "\033[1;31m ERROR: keystone didn't come up. Aborting... \033[m" 
            exit 1
        fi
        sleep ${interval}
    done
}

install(){
    echo -e "\033[1;36m Begin installing Keystone... \033[m"
    if [ ! "$(docker images | grep opensdsio/opensds-authchecker)" ]
    then
        echo -e "\033[3;33m Keystone image is not available locally. \033[m"
        echo -e "\033[3;33m Pulling opensdsio/opensds-authchecker docker image... \033[m"
        docker pull opensdsio/opensds-authchecker:latest
    fi
    echo -e "\033[3;33m Installing Keystone from docker image. \033[m"
    echo -e "\033[3;33m Keystone docker image is pulled. Starting the container... \033[m"

    docker run -d --privileged=true --restart=always --net=host --name=opensds-authchecker opensdsio/opensds-authchecker:latest > /dev/null

    echo -e "\033[3;33m Copying the keystone configuration files... \033[m"
    docker cp "./conf/keystone.policy.json" opensds-authchecker:/etc/keystone/policy.json

    echo -e "\033[3;33m Setting the keystone credentials... \033[m"
    keystone_credentials

    echo -e "\033[3;33m Waiting for Keystone service to come up... \033[m"
    wait_for_keystone
    python3 ./ministone.py endpoint_bulk_update keystone "http://${HOST_IP}/identity"  > /dev/null

    if [ ! "$(docker ps -a | grep opensds-authchecker)" ]
    then
        echo -e "\e[1;31m Something went wrong. Keystone is not installed. \e[0m" 
    else
        echo -e "\033[1;32m Keystone service is up and running. \033[m"
        echo -e "\033[1;36m Begin installing SODA Dashboard... \033[m"
        install_dashboard $@        
        
        if [[ $1 == 'install' ]]
        then
            if [ ! "$(docker ps -a | grep soda-dashboard)" ]
            then
                echo -e "\e[1;31m Something went wrong. SODA Dashboard is not installed. \e[0m" 
            else
                echo -e "\033[1;32m SODA Dashboard is installed successfully. \033[m"
                echo -e "\033[1;32m You can login to the dashboard by typing http://$HOST_IP:8088 in the address bar. \033[m"
            fi                    
        fi        
    fi
}

install_dashboard(){
    
    HOST_IP="${HOST_IP:=127.0.0.1}"
    
    echo -e "\033[3;33m The HOST IP is $HOST_IP \033[m"

    echo -e "\033[3;33m The Dashboard Release version is $DASHBOARD_RELEASE_VERSION \033[m"

    docker run -d --net=host --restart=always --name soda-dashboard \
    -e OPENSDS_AUTH_URL=http://$HOST_IP/identity \
    -e OPENSDS_HOTPOT_URL=http://$HOST_IP:50040 \
    -e OPENSDS_GELATO_URL=http://$HOST_IP:8089 \
    -e SODA_DELFIN_URL=http://$HOST_IP:8190 \
    -e OPENSDS_S3_URL=http://$HOST_IP:8090 \
    -e OPENSDS_S3_HOST=$HOST_IP \
    -e OPENSDS_S3_PORT=8090 \
    -e SODA_PROMETHEUS_PORT=9090 \
    -e SODA_ALERTMANAGER_PORT=9093 \
    -e SODA_ALERTMANAGER_URL=http://$HOST_IP:9093 \
    -e SODA_GRAFANA_PORT=3000 \
    -e STORAGE_SERVICE_PLAN_ENABLED=true sodafoundation/dashboard:$DASHBOARD_RELEASE_VERSION  > /dev/null
}

install_srm_toolchain() {
    install $@
    mkdir -p /opt/srm-toolchain
    srm_toolchain_work_dir=/opt/srm-toolchain
    cp -a ./conf/srm-toolchain/. $srm_toolchain_work_dir
    
    prometheus_image_tag="${PROMETHEUS_IMAGE_TAG:=v2.23.0}"
    prometheus_port="${SODA_PROMETHEUS_PORT:=9090}"
    alertmanager_image_tag="${ALERTMANAGER_IMAGE_TAG:=v0.21.0}"
    alertmanager_port="${SODA_ALERTMANAGER_PORT:=9093}"
    grafana_image_tag="${GRAFANA_IMAGE_TAG:=7.3.5}"
    grafana_port="${SODA_GRAFANA_PORT:=3000}"   
        
    # replace the Prometheus, Alertmanager and Grafana image tags and ports in the docker compose file.
    sed -i 's/HOST_IP=.*/HOST_IP='"$HOST_IP"'/g' $srm_toolchain_work_dir/docker-compose.yml
    sed -i 's/prom\/prometheus:.*/prom\/prometheus:'"$prometheus_image_tag"'/g' $srm_toolchain_work_dir/docker-compose.yml
    sed -i 's/SODA_PROMETHEUS_PORT*/'"$prometheus_port"'/g' $srm_toolchain_work_dir/docker-compose.yml
    sed -i 's/prom\/alertmanager.*/prom\/alertmanager:'"$alertmanager_image_tag"'/g' $srm_toolchain_work_dir/docker-compose.yml
    sed -i 's/SODA_ALERTMANAGER_PORT*/'"$alertmanager_port"'/g' $srm_toolchain_work_dir/docker-compose.yml
    sed -i 's/grafana\/grafana.*/grafana\/grafana:'"$grafana_image_tag"'/g' $srm_toolchain_work_dir/docker-compose.yml
    sed -i 's/SODA_GRAFANA_PORT*/'"$grafana_port"'/g' $srm_toolchain_work_dir/docker-compose.yml

    # replace host_ip and Alertmanager Port in prometheus configuration
    sed -i 's/HOST_IP/'"$HOST_IP"'/g' $srm_toolchain_work_dir/prometheus/prometheus.yml
    sed -i 's/SODA_ALERTMANAGER_PORT*/'"$alertmanager_port"'/g' $srm_toolchain_work_dir/prometheus/prometheus.yml

    # replace host_ip and prometheus port in datasource configuration for grafana
    sed -i 's/HOST_IP/'"$HOST_IP"'/g' $srm_toolchain_work_dir/grafana/provisioning/datasources/all.yml
    sed -i 's/SODA_PROMETHEUS_PORT*/'"$prometheus_port"'/g' $srm_toolchain_work_dir/grafana/provisioning/datasources/all.yml
    
    # set PROMETHEUS as the default exporter
    export PROMETHEUS=True

    docker-compose -f $srm_toolchain_work_dir/docker-compose.yml up -d

    check_install

}

check_install() {
    if [ ! "$(docker ps -a | grep monitoring_prometheus)" ]
    then
        echo -e "\e[1;31m Something went wrong. Prometheus is not installed. \e[0m" 
    else
        echo -e "\033[1;32m Prometheus is installed successfully. \033[m"        
    fi

    if [ ! "$(docker ps -a | grep monitoring_alertmanager)" ]
    then
        echo -e "\e[1;31m Something went wrong. Alertmanager is not installed. \e[0m" 
    else
        echo -e "\033[1;32m Alertmanager is installed successfully. \033[m"        
    fi

    if [ ! "$(docker ps -a | grep monitoring_grafana)" ]
    then
        echo -e "\e[1;31m Something went wrong. Grafana is not installed. \e[0m" 
    else
        echo -e "\033[1;32m Grafana is installed successfully. \033[m"        
    fi

    if [ ! "$(docker ps -a | grep opensds-authchecker)" ]
    then
        echo -e "\e[1;31m Something went wrong. Keystone is not installed. \e[0m" 
    else
        echo -e "\033[1;32m Keystone service is up and running. \033[m"
    fi

    if [ ! "$(docker ps -a | grep soda-dashboard)" ]
    then
        echo -e "\e[1;31m Something went wrong. SODA Dashboard is not installed. \e[0m" 
    else
        echo -e "\033[1;32m SODA Dashboard is installed successfully. \033[m"
        echo -e "\033[1;32m You can login to the dashboard by typing http://$HOST_IP:8088 in the address bar. \033[m"
    fi
}

uninstall(){
    echo -e "\033[3;33m Uninstalling keystone... \033[m"
    echo -e "\033[3;33m Stopping the keystone docker container... \033[m"
    docker stop opensds-authchecker

    echo -e "\033[3;33m Removing the keystone docker container... \033[m"
    docker rm opensds-authchecker
    
    if [ ! "$(docker ps -a | grep opensds-authchecker)"]
    then
        echo -e "\033[1;32m Keystone is uninstalled successfully. \033[m"
    else
        echo -e "\e[1;31m Something went wrong. Keystone is not uninstalled. \e[0m" 
    fi

    echo -e "\033[3;33m Uninstalling SODA Dashboard... \033[m"
    echo -e "\033[3;33m Stopping the Dashboard docker container... \033[m"
    docker stop soda-dashboard

    echo -e "\033[3;33m Removing the Dashboard docker container... \033[m"
    docker rm soda-dashboard

    if [ ! "$(docker ps -a | grep soda-dashboard)"]
    then
        echo -e "\033[1;32m SODA Dashboard is uninstalled successfully. \033[m"
    else
        echo -e "\e[1;31m Something went wrong. SODA Dashboard is not uninstalled. \e[0m" 
    fi

    echo -e "\033[3;33m Uninstalling Prometheus... \033[m"
    echo -e "\033[3;33m Stopping the Prometheus docker container... \033[m"
    docker stop monitoring_prometheus

    echo -e "\033[3;33m Removing the Prometheus docker container... \033[m"
    docker rm monitoring_prometheus

    if [ ! "$(docker ps -a | grep monitoring_prometheus)"]
    then
        echo -e "\033[1;32m Prometheus is uninstalled successfully. \033[m"
    else
        echo -e "\e[1;31m Something went wrong. Prometheus is not uninstalled. \e[0m" 
    fi
    
    echo -e "\033[3;33m Uninstalling Alertmanager... \033[m"
    echo -e "\033[3;33m Stopping the Alertmanager docker container... \033[m"
    docker stop monitoring_alertmanager

    echo -e "\033[3;33m Removing the Alertmanager docker container... \033[m"
    docker rm monitoring_alertmanager

    if [ ! "$(docker ps -a | grep monitoring_alertmanager)"]
    then
        echo -e "\033[1;32m Alertmanager is uninstalled successfully. \033[m"
    else
        echo -e "\e[1;31m Something went wrong. Alertmanager is not uninstalled. \e[0m" 
    fi

    echo -e "\033[3;33m Uninstalling Grafana... \033[m"
    echo -e "\033[3;33m Stopping the Grafana docker container... \033[m"
    docker stop monitoring_grafana

    echo -e "\033[3;33m Removing the Grafana docker container... \033[m"
    docker rm monitoring_grafana

    if [ ! "$(docker ps -a | grep monitoring_grafana)"]
    then
        echo -e "\033[1;32m Grafana is uninstalled successfully. \033[m"
    else
        echo -e "\e[1;31m Something went wrong. Grafana is not uninstalled. \e[0m" 
    fi
    
}

uninstall_purge() {
    prometheus_image_tag="${PROMETHEUS_IMAGE_TAG:=v2.23.0}"
    prometheus_port="${SODA_PROMETHEUS_PORT:=9090}"
    alertmanager_image_tag="${ALERTMANAGER_IMAGE_TAG:=v0.21.0}"
    alertmanager_port="${SODA_ALERTMANAGER_PORT:=9093}"
    grafana_image_tag="${GRAFANA_IMAGE_TAG:=7.3.5}"
    grafana_port="${SODA_GRAFANA_PORT:=3000}" 
    uninstall
    echo -e "\e[1;31m This will delete the Keystone, Dashboard and SRM Toolchain (Prometheus, Alertmanager, Grafana) docker images. \e[0m" 

    # Purge Keystone Image
    if [ ! "$(docker images | grep opensdsio/opensds-authchecker)" ]
    then
        echo "Keystone image is not available."        
    else
        echo -e "\e[1;31m Removing keystone image. \e[0m" 
        docker rmi opensdsio/opensds-authchecker
        echo -e "\033[32m Keystone image has been removed. \033[m"
    fi
    
    # Purge Dashboard image
    if [ ! "$(docker images | grep sodafoundation/dashboard)" ]
    then
        echo "Dashboard image is not available."        
    else
        echo -e "\e[1;31m Removing dashboard image. \e[0m" 
        docker rmi sodafoundation/dashboard:$DASHBOARD_RELEASE_VERSION
        echo -e "\033[32m Dashboard image has been removed. \033[m"
    fi
    
    # Purge Prometheus Image
    if [ ! "$(docker images | grep prom/prometheus)" ]
    then
        echo "Prometheus image is not available."        
    else
        echo -e "\e[1;31m Removing prometheus image. \e[0m" 
        docker rmi prom/prometheus:$prometheus_image_tag
        echo -e "\033[32m Prometheus image has been removed. \033[m"
    fi

    # Purge Alertmanager Image
    if [ ! "$(docker images | grep prom/alertmanager)" ]
    then
        echo "Alertmanager image is not available."        
    else
        echo -e "\e[1;31m Removing alertmanager image. \e[0m" 
        docker rmi prom/alertmanager:$alertmanager_image_tag
        echo -e "\033[32m Alertmanager image has been removed. \033[m"
    fi

    # Purge Grafana Image
    if [ ! "$(docker images | grep grafana/grafana)" ]
    then
        echo "Grafana image is not available."        
    else
        echo -e "\e[1;31m Removing grafana image. \e[0m" 
        docker rmi grafana/grafana:$grafana_image_tag
        echo -e "\033[32m Grafana image has been removed. \033[m"
    fi

    # Purge Prometheus Volume
    if [ ! "$(docker volume ls | grep prometheus_data)" ]
    then
        echo "Prometheus volume is not available."        
    else
        echo -e "\e[1;31m Removing prometheus volume. \e[0m" 
        docker volume rm $(docker volume ls | grep prometheus_data)
        echo -e "\033[32m Prometheus volume has been removed. \033[m"
    fi

    # Purge Grafana Volume
    if [ ! "$(docker volume ls | grep grafana_data)" ]
    then
        echo "Grafana volume is not available."        
    else
        echo -e "\e[1;31m Removing grafana volume. \e[0m" 
        docker volume rm $(docker volume ls | grep grafana_data)
        echo -e "\033[32m Grafana volume has been removed. \033[m"
    fi

    # Deleting the SRM Toolchain work folder
    echo -e "\e[1;31m Deleting the SRM toolchain workfolder. \e[0m" 
    rm -Rf /opt/srm-toolchain/

    echo -e "\033[32m Uninstall purge is completed. \033[m"
}


# ***************************

KEYSTONE_CONFIG_DIR=${KEYSTONE_CONFIG_DIR:-/etc/keystone}
if [[ -e $TOP_DIR/local.conf ]];then
    source $TOP_DIR/local.conf
fi

case "$# $1" in
    "1 install")
    echo -e "\033[1;36m Welcome to the SODA Experience installer.... \033[m"
    install $@
    ;;
    "1 install_srm_toolchain")
    echo -e "\033[1;36m Welcome to the SODA Experience installer.... \033[m"
    echo -e "\033[1;36m This installer will install SODA Dashboard, Keystone and the SRM Toolchain which is required for Delfin UI. \033[m"
    install_srm_toolchain $@
    ;;
    "1 uninstall")
    echo -e "\033[1;31m Starting uninstallation... \033[m"
    uninstall $@
    ;;
    "1 uninstall_purge")
    echo "Starting uninstall purge..."
    uninstall_purge $@
    ;;
     *)
    echo "Usage: $(basename $0) <install|uninstall|uninstall_purge>"
    echo "./install.sh install : Install Keystone Authentication and Dashboard."
    echo "./install.sh install_srm_toolchain : Install Keystone Authentication, Dashboard and SRM Toolchain."
    echo "./install.sh uninstall : Uninstall Keystone Authentication, Dashboard and SRM Toolchain.."
    echo "./install.sh uninstall_purge : Uninstall and purge Keystone Authentication, Dashboard and SRM Toolchain."
    exit 1
    ;;
esac
