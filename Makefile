.PHONY: install start dev clean

install:
	npm install

start:
	npm start

dev:
	npm run dev

clean:
	rm -rf node_modules
