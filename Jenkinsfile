pipeline {
    agent any
    tools { maven 'Maven-3.9' }

    environment {
        KUBECONFIG      = '/etc/rancher/k3s/k3s.yaml'
        NEXUS_URL       = '192.168.42.133:8082'
        BACKEND_IMAGE   = '192.168.42.133:8082/inscription-backend'
        FRONTEND_IMAGE  = '192.168.42.133:8082/inscription-frontend'
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
                sh 'docker stop nexus || true'
                sh 'sleep 5'
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

        stage('Build & Push → Nexus') {
            steps {
                sh 'docker start nexus'
                // Attendre que Nexus soit vraiment prêt
                sh '''
                    echo "Attente démarrage Nexus..."
                    for i in $(seq 1 30); do
                        STATUS=$(curl -s http://192.168.42.133:8081/service/rest/v1/status 2>/dev/null | grep -o "available" || echo "")
                        if [ "$STATUS" = "available" ]; then
                            echo "Nexus est prêt !"
                            break
                        fi
                        echo "Tentative $i/30 — Nexus pas encore prêt..."
                        sleep 10
                    done
                '''
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-credentials',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh 'echo $NEXUS_PASS | docker login $NEXUS_URL -u $NEXUS_USER --password-stdin'
                    dir('backend') {
                        sh 'docker build -t $BACKEND_IMAGE:v1 .'
                        sh 'docker push $BACKEND_IMAGE:v1'
                    }
                    dir('frontend') {
                        sh 'docker build -t $FRONTEND_IMAGE:v1 .'
                        sh 'docker push $FRONTEND_IMAGE:v1'
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
        success { echo '🎉 Pipeline réussi — Images dans Nexus !' }
        failure { echo '❌ Pipeline échoué' }
        always  {
            sh 'docker logout $NEXUS_URL || true'
            sh 'docker start nexus || true'
        }
    }
}
