IMAGE     := ishakantony/cellar
URL       := https://cellar.ishak.stream
PLATFORMS := linux/amd64,linux/arm64

.PHONY: publish publish-app publish-migrate

publish: publish-app publish-migrate

publish-app:
	docker buildx build \
		--platform $(PLATFORMS) \
		--build-arg NEXT_PUBLIC_BETTER_AUTH_URL=$(URL) \
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
