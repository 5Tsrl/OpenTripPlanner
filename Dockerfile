FROM openjdk:8u121-jre-alpine

ENV \
  OTP_ROOT='/var/otp/' \
  TZ='Europe/Rome' \
  JAVA_OPTS='-Xms4G -Xmx4G'

WORKDIR ${OTP_ROOT}

COPY target/*-shaded.jar otp-shaded.jar

RUN chmod -R 777 ${OTP_ROOT}

 # docker build -t registry:5000/otp  . ;
 # docker-compose up otp-mato-build-graph
 # docker-compose up -d otp-mato
