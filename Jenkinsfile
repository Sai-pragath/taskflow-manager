pipeline {
    agent any

    environment {
        PROJECT_DIR = '/home/ubuntu/taskflow-manager'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Sai-pragath/taskflow-manager.git',
                    credentialsId: 'dockerhub-credentials'
            }
        }

        stage('Pull Latest') {
            steps {
                sh """
                    cd ${PROJECT_DIR}
                    git pull origin main
                """
            }
        }

        stage('Build & Deploy') {
            steps {
                sh """
                    cd ${PROJECT_DIR}
                    docker compose down
                    docker compose up --build -d
                """
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 45'
                sh 'curl -f http://localhost:8080/actuator/health || exit 1'
                sh 'curl -f http://localhost:3000 || exit 1'
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo 'TaskFlow deployed successfully!'
        }
        failure {
            echo 'Deployment failed! Rolling back...'
            sh """
                cd ${PROJECT_DIR}
                docker compose down
                docker compose up -d
            """
        }
    }
}
