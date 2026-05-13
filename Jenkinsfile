pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        // Replace with your actual Docker Hub username
        DOCKERHUB_USERNAME = 'saipragath' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy') {
            steps {
                // We do NOT need to 'cd' anywhere. Jenkins is already in the project root!
                sh '''
                    # Export the variable so docker-compose can use it
                    export DOCKERHUB_USERNAME=${DOCKERHUB_USERNAME}
                    
                    # Stop old containers
                    docker-compose down || true
                    
                    # Build new images and start containers in the background
                    docker-compose up -d --build
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh 'sleep 10'
                // Check if backend is responding (assuming port 8080)
                sh 'curl -f http://localhost:8080/actuator/health || exit 1'
            }
        }
    }

    post {
        always {
            // Clean up dangling images to save space on EC2
            sh 'docker image prune -f'
        }
        failure {
            echo 'Deployment failed! Check the logs above.'
            // If you want to rollback, do it here without cd /home/ubuntu...
            sh 'docker-compose down || true'
        }
    }
}
