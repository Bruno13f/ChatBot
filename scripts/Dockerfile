FROM ubuntu:22.04

# Install dependencies and add MongoDB repository
RUN apt-get update && apt-get install -y \
    cron \
    curl \
    gnupg \
    && curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor \
    && echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-database-tools \
    && rm -rf /var/lib/apt/lists/*

COPY backup-database.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/backup-database.sh

# Create entrypoint script that sets up cron with env vars at runtime
RUN echo '#!/bin/bash\n\
    echo "Creating cron job with environment variables..."\n\
    echo "0 2 * * * root MONGO_URI=\"$MONGO_URI\" MONGO_BACKUP_URI=\"$MONGO_BACKUP_URI\" /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1" > /etc/cron.d/mongodb-backup\n\
    chmod 0644 /etc/cron.d/mongodb-backup\n\
    echo "Starting cron daemon..."\n\
    exec cron -f' > /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]