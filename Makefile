.DEFAULT_GOAL := up
.PHONY: up down logs smoke check
NODE_ENV_FILE := $(if $(wildcard .env),--env-file=.env)

up:
	docker compose up --build -d --wait
	@docker compose port web 8080

down:
	docker compose --profile "*" down

logs:
	docker compose logs --tail=100 --follow

smoke: up
	node $(NODE_ENV_FILE) scripts/smoke.js

check:
	npm ci
	npx prisma generate
	npx playwright install chromium
	docker compose --profile test up --build -d --wait
	node $(NODE_ENV_FILE) --run check
