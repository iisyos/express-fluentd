# docker-compose up -d --buildしたのちにnodeコンテナでnpm iを実行する
init:
	docker-compose up -d --build
	docker-compose exec node npm i
up:
	docker-compose up -d
build:
	docker-compose up -d --build	
stop:
	docker-compose stop
log:
	docker-compose logs -f
restart:
	docker-compose restart
