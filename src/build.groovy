pipeline {
    agent any

    stages {
        stage('Clone repository') {
            steps {
                git 'https://github.com/Alessia38/Devise_TU.git'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Construire l'image Docker à partir du Dockerfile
                    docker.build('devise-converter-app')
                }
            }
        }
        
        stage('Run tests') {
            steps {
                script {
                    // Exécuter les tests dans le conteneur Docker
                    docker.image('devise-converter-app').inside {
                        sh 'npm install'
                        sh 'npm test'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Déploiement terminé !'
            }
        }
    }
}
