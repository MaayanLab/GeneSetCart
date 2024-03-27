FROM python:3.9-bullseye
ENV DEBIAN_FRONTEND=noninteractive

RUN set -x \
  && echo "Preparing system..." \
  && apt-get -y update \
  && apt-get -y --no-install-recommends install \
    git \
    python3-dev \
    python3-pip \
    python3-setuptools \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install --no-cache-dir --upgrade pip

RUN mkdir backend

COPY requirements.txt /backend

WORKDIR /backend

RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8000

RUN pip3 install gunicorn

CMD gunicorn --workers 2 --log-level debug --timeout 600 --bind 0.0.0.0:8000 app:app