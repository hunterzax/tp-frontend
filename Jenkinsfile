pipeline {
    agent any
    environment {
        DOCKER_IMAGE = 'TPA-FRONT-END'
        DOCKER_REGISTRY = 'https://nx-registry.nueamek.app'
        WEB_VERSION = ''
        DOCKER_REGISTRY_USER = 'tsxadmin'
        DOCKER_REGISTRY_PASS = 'Vpkdwxwso001'
    }
    stages {
        stage('Load Environment Variables') {
            steps {
                script {
                    // Load variables from .env
                    def envVars = readFile('.env').split('\n')
                    envVars.each { line ->
                        def keyValue = line.trim().split('=')
                        if (keyValue.size() == 2 && keyValue[0] == "NEXT_PUBLIC_WEB_VERSION") {
                            env.WEB_VERSION = keyValue[1]
                        }
                    }
                    echo "Using Web Version: ${env.WEB_VERSION}"
                }
            }
        }
        stage('Clone Repository') {
            steps {
                git branch: 'BuildX', url: 'https://git.nueamek.app/Prompt.TPA/TPA-FRONT-END.git', credentialsId: 'gitea-nx'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:${WEB_VERSION} --platform linux/amd64 ."
                }
            }
        }
        stage('Push to Docker Registry') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-registry-nx', 
                                                      usernameVariable: 'tsxadmin', 
                                                      passwordVariable: 'Vpkdwxwso001')]) {
                        def fullImageTag = "${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${WEB_VERSION}"
                        echo "Using Docker image tag: ${fullImageTag}"
                        sh "docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                        echo "LogIn - PASS"
                        sh "docker tag ${DOCKER_IMAGE}:${WEB_VERSION} ${fullImageTag}"
                        sh "docker push ${fullImageTag}"
                    }
                }
            }
        }
        stage('Deploy Container') {
            steps {
                script {
                    sh '''
                        docker rm -f ${DOCKER_IMAGE} || true
                        docker run -d --name ${DOCKER_IMAGE} -p 80:80 ${DOCKER_IMAGE}:${WEB_VERSION}
                    '''
                }
            }
        }
    }
}