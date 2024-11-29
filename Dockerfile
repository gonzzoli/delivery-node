FROM  node:18-alpine
WORKDIR /app
COPY . .
RUN npm install 
RUN npm run build
EXPOSE 3001
CMD [ "node","./build/servidor.js" ]