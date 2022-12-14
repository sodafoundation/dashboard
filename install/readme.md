# SODA Dashboard Installation Guide

This installation guide will enable users to install the following:
- SODA Authentication using Keystone
- SODA Dashboard 
- SRM Toolchain (Prometheus, Alertmanager, Grafana) for Delfin

## Installation using Ansible

- Supported OS: **Ubuntu 20.04, Ubuntu 18.04**
- Prerequisite: **Python 3.6 or above** should be installed

## Install steps

- Clone the dashboard repository

```sh
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/sodafoundation/dashboard.git
```
- Checkout the latest Dashboard release
```sh
cd dashboard
git checkout v1.7.1
```

- Ensure no Ansible & Docker installed, OR Lastest Ansible and Docker tools are installed with versions listed below or later. 
- If Ansible & Docker are not installed in the OS, run the script `install_dependencies.sh` which will check 

```sh
cd install/ansible
chmod +x install_dependencies.sh && source install_dependencies.sh
export PATH=$PATH:/home/$USER/.local/bin
```

**NOTE:** *Tools version used for verification of Delfin under Ubuntu 20.04*
* ansible version: 2.13.6
* docker version: 20.10.21
* docker compose plugin version: 2.12.2


## Configure SODA Dashboard installer and environment variables

A SODA release conists of various projects which have their own release cycles and versions.
To install SODA Projects and enable the different features, variables have to be modified in the respective files as below:

### Set Host IP address

Set the environment variable `HOST_IP` by using the steps below. 

```bash
export HOST_IP={your_real_host_ip}
echo $HOST_IP 
```

In the SODA Dashboard Installer, modify `host_ip` in `group_vars/common.yml` and change it to the actual machine IP of the host.  
By default the `host_ip` is set to `127.0.0.1` i.e. localhost.  
```bash
# This field indicates local machine host ip
host_ip: 127.0.0.1
```

### Enable SRM Toolchain installation (optional)  

Delfin produces metrics which can be consumed by any of the exporters that are supported. Currently Delfin supports the Prometheus and Kafka exporters.
The SRM Toolchain is required to view the metrics and visualization in the SODA Dashboard.  
Update the file `ansible/group_vars/srm-toolchain.yml` and change the value of `install_srm_toolchain` to `true`.  
If this value is set to false then the metrics and visualization will not be available using SODA Dashboard. 

```sh
install_srm_toolchain: true
```

### Configure SRM Toolchain installation

Installing the SRM toolchain will install Prometheus, AlertManager and Grafana versions as per the configuration below and can be changed. 

```
prometheus_image_tag: v2.23.0
prometheus_port: 9090

alertmanager_image_tag: v0.21.0
alertmanager_port: 9093

grafana_image_tag: 7.3.5
grafana_port: 3000
```

**ATTENTION**

**Please note this will install the SRM Toolchain as docker containers.** <br />
**If you already have any of the above running then please make the appropriate changes to the docker container name and ports in the file `ansible/srm-toolchain/docker-compose.yml`.**


### Enable Storage Service Plans in multi-cloud (optional)

SODA Multi-cloud essentially allows users to register cloud storage backends, create buckets and upload objects.  
This process can be abstracted from the end users. SODA Multi-cloud now supports Storage Service Plans.  With this an admin can create Storage Service Plans and assign them to particular tenants and attach storage backends. Using Storage Service Plans abstracts the actual cloud storage backend from the end user and they will only see the service plan name assigned to their tenants. 
To enable storage service plans Update the file `ansible/group_vars/dashboard.yml` and change the value of `enable_storage_service_plans` to `true`.

```bash
enable_storage_service_plans: true
```
For more information on how to use SSP you can check out the [user guide](/guides/user-guides/multi-cloud/storage-service-plan)


### Run the installation
Run SODA Dashboard installer ansible playbook to start the deployment

Check if the hosts can be reached

```sh
ansible all -m ping -i local.hosts
```

```sh
sudo -E env "PATH=$PATH" ansible-playbook site.yml -i local.hosts
# You can use the -vvv or -vv option to enable verbose display and debug mode.
[verbosity level: -vv < -vvv]
sudo -E env "PATH=$PATH" ansible-playbook site.yml -i local.hosts -vvv
```

### SODA Dashboard UI

SODA Dashboard UI is available at `http://{your_host_ip}:8088`, please login to the dashboard using the default admin credentials: `admin/opensds@123.` 


### How to uninstall SODA Dashboard
Run SODA Dashboard installer ansible playbook to clean the environment
``` bash
sudo -E env "PATH=$PATH" ansible-playbook clean.yml -i local.hosts
# You can use the -vvv option to enable verbose display and debug mode.
sudo -E env "PATH=$PATH" ansible-playbook clean.yml -i local.hosts -vvv
```


