IMAGE     := ishakantony/cellar
IMAGE_UI  := ishakantony/cellar-ui
URL       := https://cellar.ishak.stream
PLATFORMS := linux/amd64,linux/arm64

.PHONY: publish publish-app publish-migrate publish-ui publish-local setup-builder

# Setup multi-platform builder (run once)
setup-builder:
	docker buildx create --name multiplatform --driver docker-container --use 2>/dev/null || docker buildx use multiplatform
	docker buildx inspect --bootstrap

publish: publish-app publish-migrate publish-ui

# Local single-platform builds (no --platform flag)
publish-local: publish-app-local publish-migrate-local publish-ui-local

publish-app:
	docker buildx build \
		--platform $(PLATFORMS) \
		--target runner \
		-t $(IMAGE):latest \
		--push \
		.

publish-migrate:
	docker buildx build \
		--platform $(PLATFORMS) \
		--target migrate \
		-t $(IMAGE):migrate \
		--push \
		.

publish-ui:
	docker buildx build \
		--platform $(PLATFORMS) \
		--target storybook \
		-t $(IMAGE_UI):latest \
		--push \
		.

# Local builds (single platform, loads into local docker)
publish-app-local:
	docker buildx build \
		--target runner \
		-t $(IMAGE):latest \
		--load \
		.

publish-migrate-local:
	docker buildx build \
		--target migrate \
		-t $(IMAGE):migrate \
		--load \
		.

publish-ui-local:
	docker buildx build \
		--target storybook \
		-t $(IMAGE_UI):latest \
		--load \
		.
