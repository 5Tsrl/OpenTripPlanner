FROM openjdk:8u121-jre-alpine

RUN apk add --update curl bash ttf-dejavu && \
	rm -rf /var/cache/apk/*

#VOLUME /opt/opentripplanner/graphs

ENV OTP_ROOT="/opt/opentripplanner"

WORKDIR ${OTP_ROOT}

#ADD run.sh ${OTP_ROOT}/run.sh
COPY target/*-shaded.jar otp-shaded.jar

#ENTRYPOINT exec ./run.sh