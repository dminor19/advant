#! /bin/bash
npm run build:server
docker build -t dminor01/advant:latest .
docker push dminor01/advant:latest
ssh root@dokkuhost "docker pull dminor01/advant:latest && docker tag dminor01/advant:latest dokku/advant:latest && dokku tags:deploy advant latest"