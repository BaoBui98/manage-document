pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-southeast-1'
        AWS_ACCOUNT_ID = '527055790396'
        ECR_REPO       = 'manage-document'
        ECR_URL        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
        ECS_CLUSTER    = 'manage-document-cluster'
        ECS_SERVICE    = 'manage-document-service'
        IMAGE_TAG      = "${BUILD_NUMBER}"
    }

    stages {
        stage('Cleanup') {
            steps {
                echo 'Cleaning up unused Docker resources...'
                sh 'docker system prune -f'
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building image: ${ECR_REPO}:${IMAGE_TAG}"
                sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
                sh "docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_URL}:${IMAGE_TAG}"
                sh "docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_URL}:latest"
            }
        }

        stage('Login to ECR') {
            steps {
                sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
            }
        }

        stage('Push to ECR') {
            steps {
                echo "Pushing image to ECR..."
                sh "docker push ${ECR_URL}:${IMAGE_TAG}"
                sh "docker push ${ECR_URL}:latest"
            }
        }

        stage('Deploy to ECS') {
            steps {
                echo "Deploying to ECS Fargate..."
                sh """
                    aws ecs update-service \
                        --cluster ${ECS_CLUSTER} \
                        --service ${ECS_SERVICE} \
                        --desired-count 1 \
                        --force-new-deployment \
                        --region ${AWS_REGION}
                """
            }
        }

        stage('Cleanup Images') {
            steps {
                echo 'Removing local Docker images...'
                sh "docker rmi ${ECR_URL}:${IMAGE_TAG} || true"
                sh "docker rmi ${ECR_URL}:latest || true"
                sh "docker rmi ${ECR_REPO}:${IMAGE_TAG} || true"
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully! App deployed to ECS.'
        }
        failure {
            echo '❌ Pipeline failed! Check logs above.'
        }
    }
}
