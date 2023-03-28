all: build

clean:
	-rm app
	-rm -rf handler/build
	-rm -rf application/build
	-rm -rf application/node_modules

build_application:
	cd application && npm i && npm run build

build_handler:
	cp -R application/build handler/build
	cd handler && go build -o ../app .

build: clean build_application build_handler

run: build
	./app
