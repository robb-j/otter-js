FROM node


RUN mkdir -p /app
WORKDIR /app


EXPOSE 80


# VOLUME /app/logs


COPY package.json /app/
RUN npm install --silent


COPY lib /app/lib


RUN node node_modules/.bin/apidoc -i web/ -o docs/ --silent


CMD node node_modules/.bin/nodemon --exitcrash --watch web web/server.js
