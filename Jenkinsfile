pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'registry.gitlab.com/fintech/loanpulse'
        DOCKER_CREDENTIALS_ID = 'gitlab-registry-credentials'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        PYTHON_VENV = "backend/venv"
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo 'Checking out source code from GitLab repository...'
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo 'Setting up Python virtual environment and dependencies...'
                sh '''
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install --upgrade pip
                    pip install -r backend/requirements.txt
                '''
            }
        }

        stage('Backend Linting & Code Quality') {
            steps {
                echo 'Running lint checks...'
                sh '''
                    . venv/bin/activate
                    pip install flake8
                    flake8 backend --max-line-length=120 --exclude=migrations,venv
                '''
            }
        }

        stage('Run Automated Tests') {
            steps {
                echo 'Executing Pytest test suite with coverage report...'
                sh '''
                    . venv/bin/activate
                    pytest -v --junitxml=pytest-report.xml
                '''
            }
            post {
                always {
                    junit 'pytest-report.xml'
                }
            }
        }

        stage('Frontend Build & Test') {
            steps {
                echo 'Building React Vite frontend...'
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Security Vulnerability Scan') {
            steps {
                echo 'Running dependency safety & secret audit...'
                sh '''
                    . venv/bin/activate
                    pip install pip-audit
                    pip-audit || true
                '''
            }
        }

        stage('Build & Push Docker Images') {
            when {
                branch 'main'
            }
            steps {
                echo 'Building and publishing production Docker containers...'
                sh '''
                    docker build -t ${DOCKER_REGISTRY}/backend:${IMAGE_TAG} -f docker/backend.Dockerfile .
                    docker build -t ${DOCKER_REGISTRY}/frontend:${IMAGE_TAG} -f docker/frontend.Dockerfile .
                '''
            }
        }

        stage('Deploy to Staging / Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying LoanPulse stack via Docker Compose...'
                sh '''
                    docker-compose down
                    docker-compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline Succeeded for build ${env.BUILD_NUMBER}!"
        }
        failure {
            echo "CI/CD Pipeline Failed for build ${env.BUILD_NUMBER}. Please check console logs."
        }
    }
}
