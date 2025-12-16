C:\Django\sanaol-cnt-00>docker compose up -d
[+] Running 7/8
✔ Network sanaol-cnt-00_default Created 0.1s
✔ Volume "sanaol-cnt-00_frontend-node-modules" Created 0.0s
✔ Volume "sanaol-cnt-00_mysql-data" Created 0.0s
✔ Volume "sanaol-cnt-00_redis-data" Created 0.0s

- Container sanaol-cnt-00-mysql-1 Starting 1.5s
  ✔ Container sanaol-cnt-00-redis-1 Started 1.5s
  ✔ Container sanaol-cnt-00-api-1 Created 0.3s
  ✔ Container sanaol-cnt-00-frontend-1 Created 0.3s
  Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3306 -> 127.0.0.1:0: listen tcp 0.0.0.0:3306: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.
