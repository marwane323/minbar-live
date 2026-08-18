.PHONY: up down logs db-shell redis-cli lint test migrate seed

up:
	docker-compose -f docker-compose.dev.yml up --build

down:
	docker-compose -f docker-compose.dev.yml down -v

logs:
	docker-compose -f docker-compose.dev.yml logs -f

db-shell:
	docker-compose -f docker-compose.dev.yml exec postgres psql -U minbar minbar_live

redis-cli:
	docker-compose -f docker-compose.dev.yml exec redis redis-cli

lint:
	pre-commit run --all-files

test:
	pytest tests/

migrate:
	alembic upgrade head

seed:
	python scripts/seed.py
