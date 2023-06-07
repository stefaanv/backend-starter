# Global ARGs, must be defined before the first stage !
ARG BUILD_DIR="/tmp/build"
ARG AP="/usr/bruyland"

#FROM node:16.13.1-alpine as base
FROM node:18-alpine as base
FROM base AS builder

ARG BUILD_DIR 
# Set the working directory
WORKDIR ${BUILD_DIR}

# Copy source code into build container
COPY ./*.js* ./
COPY ./src/ ./src/
COPY ./config/ ./config/

# install node packages and build BACKEND
WORKDIR ${BUILD_DIR}
RUN npm set progress=false && npm config set depth 0 && \
  npm ci && npm cache clean --force && \
  npm run build && \
  npm prune --production

# ---- build the release container ----
FROM base as release
# setup timezone Europe/Brussels
RUN ln -sf /usr/share/zoneinfo/Europe/Brussels /etc/localtime

# copying the arguments into the current container
ARG BUILD_DIR
ARG COMMIT
ARG TAG
ARG AP

# Print important parameter values
RUN echo COMMIT=$COMMIT
RUN echo TAG=$TAG
RUN echo AP=$AP
RUN echo BUILD_DIR=$BUILD_DIR

# Set the working directory
WORKDIR ${AP}

# OLD # Install npm dependencies
# RUN echo COPYING BUILT APP FROM BUILDER CONTAINER
# COPY --from=builder ${BUILD_DIR}/apps/backend/package.json ${AP}
# COPY --from=builder ${BUILD_DIR}/apps/backend/package-lock.json ${AP}
# COPY --from=builder ${BUILD_DIR}/apps/backend/dist/ ${AP}/dist/
# COPY --from=builder ${BUILD_DIR}/apps/backend/static/ ${AP}/static/
# RUN npm install --only=production --no-optional
COPY --from=builder ${BUILD_DIR}/dist ${AP}/dist
COPY --from=builder ${BUILD_DIR}/node_modules ${AP}/node_modules
COPY --from=builder ${BUILD_DIR}/package.json ${AP}/

# Deault environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV COMMIT=$COMMIT
ENV TAG=$TAG

# Expose port
EXPOSE ${PORT}

# Volumes
RUN mkdir -p logs && chown 1000 logs && chgrp 1000 logs && chmod -R o+w logs
VOLUME ["${AP}/logs", "${AP}/config"]

# Change user
USER node

# Run the container under "node" user by default
CMD [ "node", "dist/src/main" ]
