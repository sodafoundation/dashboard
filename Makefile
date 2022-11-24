# Copyright 2018 The OpenSDS Authors.
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

IMAGE = sodafoundation/dashboard
VERSION := v1.7.1
BASE_DIR := $(shell pwd)
BUILD_DIR := $(BASE_DIR)/build
DIST_DIR := $(BASE_DIR)/build/dist
BUILD_TGT := soda-dashboard-$(VERSION)


.PHONY: all build dashboard docker clean

all:build

build:dist docker

dashboard:
	chmod +x ./image_builder.sh \
	  && ./image_builder.sh

docker: dashboard
	docker build . -t $(IMAGE):$(VERSION)

clean:
	sudo rm -Rf ./build
	service nginx stop
	sudo rm -rf /etc/nginx/sites-available/default /var/www/html/* ./dist warn=False
	npm uninstall --unsafe-perm
	npm uninstall --unsafe-perm -g @angular/cli@1.7.4

version:
	@echo ${VERSION}

.PHONY: dist
dist:
	rm -fr $(DIST_DIR) && mkdir -p $(DIST_DIR)/$(BUILD_TGT)/
	cd $(DIST_DIR) && \
	cp ../../install/install.sh $(BUILD_TGT)/ && \
	cp ../../install/ministone.py $(BUILD_TGT)/ && \
	cp -R ../../install/conf $(BUILD_TGT)/ && \
	cp $(BASE_DIR)/LICENSE.md $(BUILD_TGT) && \
	zip -r $(DIST_DIR)/$(BUILD_TGT).zip $(BUILD_TGT) && \
	tar zcvf $(DIST_DIR)/$(BUILD_TGT).tar.gz $(BUILD_TGT)
	tree $(DIST_DIR)