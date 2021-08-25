FROM node:14-alpine

WORKDIR /workspace

COPY package.json /workspace/

RUN npm install

COPY . .

RUN npm build

CMD ["npm", "run", "start"]