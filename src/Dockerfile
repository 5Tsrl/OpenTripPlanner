FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY client /usr/share/nginx/html
#COPY client /client

# run per produzione
#docker rm -f mip-map ; docker run  -p 8086:80   --name mip-map --dns 172.21.30.133 -d registry:5000/mip-map && docker logs -f mip-map

#con mount della cartella client
#docker rm -f mip-map ; docker run -p 8086:80 -v /data/mip-map/client:/usr/share/nginx/html --name mip-map --dns 172.21.30.133 -d registry:5000/mip-map && docker logs -f mip-map
