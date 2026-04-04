docker buildx build --platform linux/amd64,linux/arm64 --tag oaktree.azurecr.io/ot-web:jelus .

docker run -it --name web 3000:3000 ot-web:hero

--no-cache
