pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
    }

    environment {
        KUBECONFIG      = '/etc/rancher/k3s/k3s.yaml'
        BACKEND_IMAGE   = 'mahmoudfalfel/inscription-backend:v1'
        FRONTEND_IMAGE  = 'mahmoudfalfel/inscription-frontend:v1'
        SONAR_URL       = 'http://localhost:9000'
    }

    stages {

        // ─── STAGE 1 : CLONE ──────────────────────────
        stage('Clone') {
            steps {
                echo '📥 Clonage depuis GitHub...'
                git branch: 'master',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/mahmoud7895/Inscription_App.git'
            }
        }

        // ─── STAGE 2 : BUILD MAVEN ────────────────────
        stage('Build Backend') {
            steps {
                echo '🔨 Build Spring Boot...'
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        // ─── STAGE 3 : SONARQUBE ──────────────────────
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Analyse SonarQube...'
                withSonarQubeEnv('SonarQube') {
                    dir('backend') {
                        sh '''
                            mvn sonar:sonar \
                              -Dsonar.projectKey=inscription-app \
                              -Dsonar.projectName="Inscription App" \
                              -Dsonar.host.url=${SONAR_URL} \
                              -Dsonar.java.binaries=target/classes
                        '''
                    }
                }
            }
        }

        // ─── STAGE 4 : QUALITY GATE ───────────────────
        stage('Quality Gate') {
            steps {
                echo '🚦 Vérification Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ─── STAGE 5 : DOCKER BUILD & PUSH ───────────
        stage('Build & Push Docker') {
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
                    dir('frontend') {
                        sh 'docker build -t $FRONTEND_IMAGE .'
                        sh 'docker push $FRONTEND_IMAGE'
                    }
                }
            }
        }

        // ─── STAGE 6 : DEPLOY K3S ─────────────────────
        stage('Deploy to K3s') {
            steps {
                echo '☸️ Déploiement sur Kubernetes...'
                sh 'kubectl apply -f k8s-deploy.yaml'
                sh 'kubectl rollout status deployment/app-backend --timeout=120s'
                sh 'kubectl rollout status deployment/app-frontend --timeout=120s'
            }
        }
    }

    post {
        success { echo '🎉 Pipeline réussi — App déployée !' }
        failure { echo '❌ Pipeline échoué — Voir les logs' }
        always  { sh 'docker logout || true' }
    }
}
