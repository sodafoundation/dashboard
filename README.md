## Summary
OpenSDS dashboard uses the front-end development framework [Angular5](https://angular.io/)
and relies on [PrimeNG](https://www.primefaces.org/primeng/) UI Components. Regardless of 
deployment or two development, prepare the corresponding environment.

## Prerequisite 

* Version information
```shell
root@proxy:~# cat /etc/issue
Ubuntu 16.04.2 LTS \n \l
```

* Download some system packages
```shell
apt-get update && apt-get install -y --no-install-recommends \
	  wget \
	  make \
	  g++ \
	  nginx \
	  && rm -rf /var/lib/apt/lists/* \
	  && apt-get clean
wget --no-check-certificate https://deb.nodesource.com/setup_8.x \
	  && chmod +x setup_8.x && ./setup_8.x \
	  && apt-get install -y nodejs
```

## Build & Start
### 1. Git clone opensds-dashboard code.
```shell
git clone https://github.com/opensds/opensds-dashboard.git
```

### 2. Build opensds dashboard.
After the build work finished, the files in the `dist` folder should be copied to the folder ` /var/www/html/`.
```shell
cd opensds-dashboard && make
```

### 3. Restart nginx
```shell
service nginx restart 
```

### 4. Access dashboard in browser.
```shell
http://localhost:8088
```
