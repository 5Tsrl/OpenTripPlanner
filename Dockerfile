FROM openjdk:8u121-jre-alpine

ENV \
  OTP_ROOT='/var/otp/' \
  TZ='Europe/Rome' \
  JAVA_OPTS='-Xms4G -Xmx4G'

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && apk update && apk add tzdata

WORKDIR ${OTP_ROOT}

COPY target/otp-1.3.0-SNAPSHOT-shaded.jar otp-shaded.jar

RUN chmod -R 777 ${OTP_ROOT}

 # docker build -t registry:5000/otp  . ;
 # docker-compose up otp-build-graph
 # docker-compose up -d otp-run-mato
