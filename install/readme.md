# SODA Experience Installer

The SODA Experience installer enables users to install the SODA Authentication module, Keystone, and the SODA Dashboard independently.  


## Pre-requisites

- This installer is currently tested and works on **Ubuntu 20.04**. 

- Python  >= 3.8.10 ***(This installer may not work on Ubuntu 18.04 since the python3 version may not be supported.)***

- Install Docker version > 20.10.21

- Export the IP address of the host machine to the environment variable

```sh
export HOST_IP=<your_host_ip> # Replace with your actual host IP
echo $HOST_IP
```

- Export the desired Dashboard Release version to the environment variable

```sh
export DASHBOARD_RELEASE_VERSION=v1.7.0 # Replace with SODA release version or docker tag for dashboard.
echo $DASHBOARD_RELEASE_VERSION
```

- Export the following environement variables for SRM Toolchain

```sh
export PROMETHEUS_IMAGE_TAG=v2.23.0
export SODA_PROMETHEUS_PORT=9090
export ALERTMANAGER_IMAGE_TAG=v0.21.0
export SODA_ALERTMANAGER_PORT=9093
export GRAFANA_IMAGE_TAG=7.3.5
export SODA_GRAFANA_PORT=3000
```
## Usage

- Download the latest release binaries.

```sh
curl https://github.com/sodafoundation/dashboard/releases/download/$DASHBOARD_RELEASE_VERSION/soda-dashboard-$DASHBOARD_RELEASE_VERSION.tar.gz
```

- Extract the scripts from the release package.

```sh
tar -xvzf soda-dashboard-$DASHBOARD_RELEASE_VERSION.tar.gz
cd soda-dashboard-$DASHBOARD_RELEASE_VERSION.tar.gz
```
- Change the permissions and provide execute privilege

```sh
chmod a+x ./install.sh ./ministone.py
```

- Run the install script

```sh
./install.sh

Usage: install.sh <install|uninstall|uninstall_purge>
./install.sh install : Install Keystone Authentication and Dashboard.
./install.sh install_srm_toolchain : Install Keystone Authentication, Dashboard and SRM Toolchain.
./install.sh uninstall : Uninstall Keystone Authentication, Dashboard and SRM Toolchain.
./install.sh uninstall_purge : Uninstall and purge Keystone Authentication, Dashboard and SRM Toolchain.
```

- To install the install Keystone Authentication and Dashboard.

```sh
./install.sh install
```

- [Optional] To install Keystone Authentication, Dashboard and SRM Toolchain (Prometheus, Alertmanager, Grafana) required for the Delfin UI.

```sh
./install.sh install_srm_toolchain
```

- To uninstall Keystone Authentication, Dashboard and SRM Toolchain (Prometheus, Alertmanager, Grafana) run the uninstall command.

```sh
./install.sh uninstall
```
- To uninstall and remove Keystone Authentication, Dashboard and SRM Toolchain (Prometheus, Alertmanager, Grafana) images run the `uninstall_purge` command.

```sh
./install.sh uninstall_purge
```





