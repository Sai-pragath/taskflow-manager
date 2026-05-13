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
                    # Export the variables
                    export DOCKERHUB_USERNAME=${DOCKERHUB_USERNAME}
                    export BACKEND_PORT=8081
                    
                    # Stop old containers
                    docker-compose --profile monitoring down || true
                    
                    # Build new images and start ALL containers (including monitoring)
                    docker-compose --profile monitoring up -d --build
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh 'sleep 10'
                // Check if backend is responding (Updated to port 8081!)
                sh 'curl -f http://localhost:8081/actuator/health || exit 1'
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
            // Rollback monitoring and app containers
            sh 'docker-compose --profile monitoring down || true'
        }
    }
}
