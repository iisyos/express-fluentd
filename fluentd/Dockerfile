# fluentd/Dockerfile
FROM fluent/fluentd:v1.12.0-debian-1.0
USER root
RUN gem install elasticsearch -v '7.14.1'
RUN gem install excon
RUN ["gem", "install", "fluent-plugin-elasticsearch", "--no-document", "--version", "5.2.2"]
USER fluent