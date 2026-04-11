pipeline {
    agent any
    tools { maven 'Maven-3.9' }
    environment {
        KUBECONFIG      = '/etc/rancher/k3s/k3s.yaml'
        BACKEND_IMAGE   = 'mahmoudfalfel/inscription-backend:v1'
        FRONTEND_IMAGE  = 'mahmoudfalfel/inscription-frontend:v1'
        SONAR_URL       = 'http://192.168.42.133:9000'
    }
    stages {
        stage('Clone') {
            steps {
                git branch: 'master',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/mahmoud7895/Inscription_App.git'
            }
        }
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
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
        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
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
        stage('Deploy to K3s') {
            steps {
                sh 'kubectl apply -f k8s-deploy.yaml'
                sh 'kubectl rollout status deployment/app-backend --timeout=120s'
                sh 'kubectl rollout status deployment/app-frontend --timeout=120s'
            }
        }
    }
    post {
        success { echo '🎉 Pipeline réussi !' }
        failure { echo '❌ Pipeline échoué' }
        always  { sh 'docker logout || true' }
    }
}
