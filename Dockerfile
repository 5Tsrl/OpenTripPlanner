FROM openjdk:8-jre-alpine

ENV \
  OTP_ROOT='/var/otp/' \
  TZ='Europe/Rome' \
  JAVA_OPTS='-Xms4G -Xmx4G'

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
  echo $TZ > /etc/timezone && \
  apk add --no-cache tzdata ttf-dejavu

WORKDIR ${OTP_ROOT}

COPY target/otp-1.4.0-SNAPSHOT-shaded.jar otp-shaded.jar

RUN chmod -R 777 ${OTP_ROOT}

 # docker build -t registry:5000/opentripplannerwc  . ;
 # docker-compose run otp-build-graph
 # docker-compose up -d otp-run-mato
