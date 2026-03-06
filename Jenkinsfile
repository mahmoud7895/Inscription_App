pipeline {
    agent { label 'Agent-VM2' } // Utilise ton agent VM2 pour le build (plus de RAM)

    environment {
        // Chemin vers ton fichier de config K3s que tu as préparé
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Jenkins télécharge ton code depuis GitHub
                checkout scm
            }
        }

        stage('Build & Push Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t mahmoudfalfel/inscription-backend:v1 .'
                    // Note: Il faut être connecté à Docker Hub sur l'agent
                    sh 'docker push mahmoudfalfel/inscription-backend:v1'
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t mahmoudfalfel/inscription-frontend:v1 .'
                    sh 'docker push mahmoudfalfel/inscription-frontend:v1'
                }
            }
        }

        stage('Deploy to K3s') {
            steps {
                // On applique le fichier de déploiement sur le cluster K3s (VM1)
                sh 'kubectl apply -f k8s-deploy.yaml'
            }
        }
    }
}
