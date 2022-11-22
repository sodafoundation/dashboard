# !/usr/bin/env bash

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
    # else
    #    echo "Something went wrong. SODA Dashboard is not uninstalled."
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
        install_dashboard

        if [ ! "$(docker ps -a | grep soda-dashboard)" ]
        then
            echo -e "\e[1;31m Something went wrong. SODA Dashboard is not installed. \e[0m" 
        else
            echo -e "\033[1;32m SODA Dashboard is installed successfully. \033[m"
            echo -e "\033[1;32m You can login to the dashboard by typing http://$HOST_IP:8088 in the address bar. \033[m"
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
    
}

uninstall_purge() {
    uninstall
    echo -e "\e[1;31m This will delete the Keystone and Dashboard docker images. \e[0m" 
    if [ ! "$(docker images | grep opensdsio/opensds-authchecker)" ]
    then
        echo "Keystone image is not available."        
    else
        echo -e "\e[1;31m Removing keystone image. \e[0m" 
        docker rmi opensdsio/opensds-authchecker
        echo -e "\033[32m Keystone image has been removed. \033[m"
    fi
    if [ ! "$(docker images | grep sodafoundation/dashboard)" ]
    then
        echo "Dashboard image is not available."        
    else
        echo -e "\e[1;31m Removing dashboard image. \e[0m" 
        docker rmi sodafoundation/dashboard:$DASHBOARD_RELEASE_VERSION
        echo -e "\033[32m Dashboard image has been removed. \033[m"
    fi
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
    install
    ;;
    "1 uninstall")
    echo -e "\033[1;31m Starting uninstallation... \033[m"
    uninstall
    ;;
    "1 uninstall_purge")
    echo "Starting uninstall purge..."
    uninstall_purge
    ;;
     *)
    echo "Usage: $(basename $0) <install|uninstall|uninstall_purge>"
    echo "./install install : Install Keystone Authentication and Dashboard."
    echo "./install uninstall : Uninstall Keystone Authentication and Dashboard."
    echo "./install uninstall_purge : Uninstall and purge Keystone Authentication and Dashboard."
    exit 1
    ;;
esac
