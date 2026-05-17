#!/bin/bash
# ==============================================================================
# TaskFlow EC2 Auto-Provisioning Script (User Data)
# ==============================================================================
# This script automatically installs Java 21, Docker, Docker Compose, and Jenkins 
# with the correct 2026 repository keys on a fresh Ubuntu EC2 instance.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting TaskFlow Infrastructure Provisioning..."

# 1. System Update
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Java 21 (Required for Jenkins)
echo "Installing Java 21..."
sudo apt-get install -y fontconfig openjdk-21-jre

# 3. Install Docker
echo "Installing Docker..."
sudo apt-get install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu

# 4. Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 5. Install Jenkins (Using current 2026 Key)
echo "Installing Jenkins..."
# Download the Jenkins GPG key
sudo curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Add Jenkins repository to apt sources
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt-get update -y
sudo apt-get install -y jenkins

# Add Jenkins user to Docker group to allow Pipeline execution
sudo usermod -aG docker jenkins

# Start and enable Jenkins
sudo systemctl enable --now jenkins

echo "========================================================================"
echo "Provisioning Complete! Jenkins is starting on port 8080."
echo "Unlock Jenkins using the password located at:"
echo "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo "Note: You may need to log out and log back in (or reboot) for Docker permissions to apply."
echo "========================================================================"
