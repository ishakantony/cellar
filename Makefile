IMAGE           := ishakantony/cellar
STORYBOOK_IMAGE := ishakantony/cellar-storybook
URL             := https://cellar.ishak.stream
PLATFORMS       := linux/amd64,linux/arm64

.PHONY: publish publish-local publish-storybook publish-local-storybook setup-builder

setup-builder:
	docker buildx create --name multiplatform --driver docker-container --use 2>/dev/null || docker buildx use multiplatform
	docker buildx inspect --bootstrap

publish:
	docker buildx build \
		--platform $(PLATFORMS) \
		-t $(IMAGE):latest \
		--push \
		.

publish-local:
	docker buildx build \
		-t $(IMAGE):latest \
		--load \
		.

publish-storybook:
	docker buildx build \
		--platform $(PLATFORMS) \
		--target storybook-runner \
		-t $(STORYBOOK_IMAGE):latest \
		--push \
		.

publish-local-storybook:
	docker buildx build \
		--target storybook-runner \
		-t $(STORYBOOK_IMAGE):latest \
		--load \
		.
