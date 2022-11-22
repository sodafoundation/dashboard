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

- Export the desired SODA Release version to the environment variable

```sh
export SODA_RELEASE_VERSION=v1.7.0 # Replace with SODA release version or docker tag for dashboard.
echo $SODA_RELEASE_VERSION
```

## Usage

- Download the latest release binaries.

```sh
curl https://github.com/sodafoundation/dashboard/releases/download/$SODA_RELEASE_VERSION/soda-dashboard-$SODA_RELEASE_VERSION.tar.gz
```

- Extract the scripts from the release package.

```sh
tar -xvzf soda-dashboard-$SODA_RELEASE_VERSION.tar.gz
cd soda-dashboard-$SODA_RELEASE_VERSION.tar.gz
```
- Change the permissions and provide execute privilege

```sh
chmod a+x ./install.sh ./ministone.py
```

- Run the install script

```sh
./install.sh

Usage: install.sh <install|uninstall|uninstall_purge>
./install install : Install Auth and Dashboard.
./install uninstall : Uninstall Keystone.
./install uninstall_purge : Purge Uninstall.

```

- Run the install command

```sh
./install.sh install
```

- To uninstall dashboard and keystone run the uninstall command.

```sh
./install.sh uninstall
```
- To uninstall and remove the dashboard and keystone images run the `uninstall_purge` command.

```sh
./install.sh uninstall_purge
```





