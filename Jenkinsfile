pipeline {
    agent { label 'Agent-VM2' }

    tools {
        maven 'Maven-3.9'
    }

    environment {
        KUBECONFIG = '/home/mahmoud/.kube/config'
        BACKEND_IMAGE = 'mahmoudfalfel/inscription-backend:v1'
        FRONTEND_IMAGE = 'mahmoudfalfel/inscription-frontend:v1'
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend (Maven)') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build & Push Backend Docker') {
            steps {
                dir('backend') {
                    sh 'docker build -t $BACKEND_IMAGE .'
                    sh 'docker push $BACKEND_IMAGE'
                }
            }
        }

        stage('Build & Push Frontend Docker') {
            steps {
                dir('frontend') {
                    sh 'docker build -t $FRONTEND_IMAGE .'
                    sh 'docker push $FRONTEND_IMAGE'
                }
            }
        }

        stage('Deploy to K3s') {
            steps {
                sh 'kubectl apply -f k8s-deploy.yaml'
            }
        }
    }
}
