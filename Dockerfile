FROM openjdk:8-jre-alpine

ENV \
  OTP_ROOT='/var/otp/' \
  TZ='Europe/Rome' \
  JAVA_OPTS='-Xms4G -Xmx4G -Duser.timezone="Europe/Rome" -Djava.util.prefs.userRoot=/tmp/'

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
  echo $TZ > /etc/timezone && \
  apk add --no-cache tzdata ttf-dejavu

USER 1000:1000
WORKDIR ${OTP_ROOT}
COPY target/otp-1.5.0-SNAPSHOT-shaded.jar otp-shaded.jar
COPY entrypoint.sh .
ENTRYPOINT ["./entrypoint.sh"]
CMD ["--help"]

# mvn clean package -DskipTests
# docker build -t registry:5000/otpwc  .        era opentripplannerwc  .   oppure docker-compose build --force build-graph-mato
# docker push registry:5000/otpwc
# docker-compose run otp-build-graph
# docker-compose up -d otp-run-mato
