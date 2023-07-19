# Express Server

## Deploy

BE - ECR

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 046055704352.dkr.ecr.eu-central-1.amazonaws.com

docker build -t 046055704352.dkr.ecr.eu-central-1.amazonaws.com/aws-poc-cloud-dev/backend:test2 .

docker push 046055704352.dkr.ecr.eu-central-1.amazonaws.com/aws-poc-cloud-dev/backend:test2

