pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
    }

    environment {
        KUBECONFIG     = '/etc/rancher/k3s/k3s.yaml'
        BACKEND_IMAGE  = 'mahmoudfalfel/inscription-backend:v1'
        FRONTEND_IMAGE = 'mahmoudfalfel/inscription-frontend:v1'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/mahmoud7895/Inscription_App.git'
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
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    dir('backend') {
                        sh 'docker build -t $BACKEND_IMAGE .'
                        sh 'docker push $BACKEND_IMAGE'
                    }
                }
            }
        }

        stage('Build & Push Frontend Docker') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    dir('frontend') {
                        sh 'docker build -t $FRONTEND_IMAGE .'
                        sh 'docker push $FRONTEND_IMAGE'
                    }
                }
            }
        }

        stage('Deploy to K3s') {
            steps {
                sh 'kubectl apply -f k8s-deploy.yaml'
            }
        }
    }

    post {
        success { echo '✅ Déploiement réussi !' }
        failure { echo '❌ Pipeline échoué - vérifier les logs' }
        always  { sh 'docker logout || true' }
    }
}
