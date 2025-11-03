# set base image (host OS)
FROM python:3.8

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get -y update
RUN apt-get install -y curl nano wget nginx git

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list



# -------------------------------
# ✅ Install MongoDB 7.0 (for Debian 12 / Bookworm)
# -------------------------------
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg && \
    echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] \
    http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
    | tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update -y && apt-get install -y mongodb-org

# Run MongoDB when the container starts
CMD ["mongod", "--bind_ip_all"]

# Optional: Disable systemctl dependency
RUN ln -s /bin/echo /bin/systemctl


# Install Node.js 20 and Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs yarn

# Install Yarn
RUN apt-get install -y yarn

# Install dependencies
RUN apt-get update && apt-get install -y python3-dev gcc

# Downgrade pip to support old Celery versions
RUN pip install "pip<24.1"

ENV ENV_TYPE staging
ENV MONGO_HOST mongo
ENV MONGO_PORT 27017
##########

ENV PYTHONPATH=$PYTHONPATH:/src/

# copy the dependencies file to the working directory
COPY src/requirements.txt .

# install dependencies
RUN pip install -r requirements.txt
