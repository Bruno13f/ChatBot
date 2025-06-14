FROM ubuntu:22.04

# Install required packages
RUN apt-get update && apt-get install -y \
    cron \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB Database Tools
RUN curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
RUN apt-get update && apt-get install -y mongodb-database-tools

# Copy the backup script
COPY backup-database.sh /usr/local/bin/backup-database.sh
RUN chmod +x /usr/local/bin/backup-database.sh

# Create cron job (runs daily at 2 AM)
RUN echo "50 14 * * * root /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1" > /etc/cron.d/mongodb-backup
RUN chmod 0644 /etc/cron.d/mongodb-backup

# Create log file
RUN touch /var/log/backup.log

# Start cron daemon
CMD ["cron", "-f"]