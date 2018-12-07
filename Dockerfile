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

# Docker build usage:
# 	docker build . -t opensdsio/dashboard:latest
# Docker run usage:
# 	docker run -d -p 8088:8088 opensdsio/dashboard:latest

FROM node:8.12.0
MAINTAINER Leon Wang <wanghui71leon@gmail.com>

ARG DEBIAN_FRONTEND=noninteractive

# Download and install some packages.
RUN apt-get update && apt-get install -y --no-install-recommends \
  sudo \
  g++ \
  nginx \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get clean

# Current directory is always /opt/dashboard.
WORKDIR /opt/dashboard

# Copy dashboard source code into container before running command.
COPY ./ ./
RUN chmod 755 ./image_builder.sh \
  && sudo ./image_builder.sh

COPY entrypoint.sh ./
# Define default command.
ENTRYPOINT /opt/dashboard/entrypoint.sh
