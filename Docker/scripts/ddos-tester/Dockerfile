FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    curl \
    wget \
    hping3 \
    siege \
    iproute2 \
    iputils-ping \
    netcat \
    jq \
    procps \
    bash \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /tests
COPY run-tests.sh /tests/run-tests.sh
RUN chmod +x /tests/run-tests.sh

ENTRYPOINT ["/tests/run-tests.sh"]
