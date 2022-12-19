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

# Docker build usage:
# 	docker build . -t sodafoundation/dashboard:latest
# Docker run usage:
# 	docker run -d -p 8088:8088 sodafoundation/dashboard:latest

FROM nginx:alpine

# Current directory is always /opt/dashboard.
WORKDIR /opt/dashboard

# Copy dashboard source dist pakcage into container before running command.
RUN mkdir /var/www/html -p
COPY ./dist /var/www/html
COPY entrypoint.sh .


# Define default command.
CMD /opt/dashboard/entrypoint.sh
