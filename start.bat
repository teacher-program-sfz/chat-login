:: Signed from DobbCraft(OSKAR) 

curl -LO https://nodejs.org/dist/v14.17.3/node-v14.17.3-x64.msi
START /WAIT node-v14.17.3-x64.msi

curl -LO https://www.apachefriends.org/xampp-files/8.0.8/xampp-windows-x64-8.0.8-0-VS16-installer.exe
START /WAIT xampp-windows-x64-8.0.8-0-VS16-installer.exe

curl -LO https://github.com/teacher-program-sfz/main2/archive/refs/heads/main.zip
TIMEOUT /T 5

tar -xf main.zip
TIMEOUT /T 3

cd main2-main
npm i mysql jwt-decode express socket.io dotenv cookie-parser jsonwebtoken bcryptjs
