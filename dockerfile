FROM node:18
#mention your working directory
WORKDIR /app
#Copy package and package-lock.json files
COPY package*.json ./
#Install Dependencies
RUN npm install
#copy application files
COPY . . 
RUN npm run build
#Expose the port the app runs on
EXPOSE 3000
#Command to run the applications
CMD ["node","dist/index.js"]