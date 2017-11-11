FROM node:alpine

WORKDIR /usr/src/app

RUN npm install gulp -g

COPY package.json .

RUN npm install

COPY . .

RUN gulp build

RUN route | awk '/^default/ { print $2 }'

EXPOSE 6969

CMD [ "gulp", "run" ]