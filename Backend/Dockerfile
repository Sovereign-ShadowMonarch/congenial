# Build Stage: Compiles the Python application
FROM python:3.7 as backend-build-stage

# Set up a virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install build dependencies for SQLCipher and application
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        git \
        tcl-dev \
        libssl-dev \
        libreadline-dev \
        zlib1g-dev \
        libffi-dev && \
    rm -rf /var/lib/apt/lists/*

# Build and install SQLCipher
RUN git clone https://github.com/sqlcipher/sqlcipher.git /tmp/sqlcipher && \
    cd /tmp/sqlcipher && \
    git checkout v4.4.0 && \
    ./configure \
        --enable-tempstore=yes \
        CFLAGS="-DSQLITE_HAS_CODEC -DSQLITE_ENABLE_FTS3 -DSQLITE_ENABLE_FTS3_PARENTHESIS" \
        LDFLAGS="-lcrypto" && \
    make -j$(nproc) && \
    make install && \
    ldconfig && \
    cd / && rm -rf /tmp/sqlcipher

WORKDIR /app

# Upgrade pip and install Python dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Install the application and build with PyInstaller
RUN pip install --no-cache-dir -e . && \
    pip install --no-cache-dir pyinstaller==3.5 && \
    # Ensure SQLCipher version 4 is detected by the application
    python -c "import sys; from rotkehlchen.db.dbhandler import detect_sqlcipher_version; version = detect_sqlcipher_version(); sys.exit(0) if version == 4 else sys.exit(1)" && \
    pyinstaller --noconfirm --clean --distpath /app/dist rotkehlchen.spec

# Runtime Stage: Minimal image to run the compiled application
FROM alpine:latest as runtime

LABEL maintainer="Backend"

ARG REVISION
ARG BACKEND_VERSION
ENV REVISION=$REVISION
ENV BACKEND_VERSION=$BACKEND_VERSION

# Install runtime dependencies (curl for healthcheck, procps for process utilities)
# Add any other essential runtime libraries your application might need if not bundled by PyInstaller
RUN apk add --no-cache \
    curl \
    procps 
    # Add any other necessary runtime libs like libffi, openssl, etc.
    # e.g., libffi openssl
    # Ensure these match versions compatible with your build if dynamically linked

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the compiled application from the build stage
COPY --from=backend-build-stage /app/dist /opt/backend

# Copy the entrypoint script
COPY ./packaging/docker/docker-entrypoint.sh /opt/backend/docker-entrypoint.sh
RUN chmod +x /opt/backend/docker-entrypoint.sh

# Create data and logs directories and set permissions
RUN mkdir -p /data /logs && \
    chown -R appuser:appgroup /data /logs /opt/backend

# Set working directory
WORKDIR /opt/backend

# Create a symlink for easier execution if needed, or call directly
# The entrypoint script should handle calling the correct executable name
# For example, if rotkehlchen.spec produces 'rotkehlchen-*-linux'
# RUN ln -s $(find /opt/backend -name 'rotkehlchen-*-linux' | head -n 1) /usr/local/bin/Backend

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 4242

# Define volumes for persistent data and logs
VOLUME ["/data", "/logs"]

# Configure healthcheck using the correct API endpoint path
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:4242/api/1/version || exit 1

# Define the entrypoint
ENTRYPOINT ["/opt/backend/docker-entrypoint.sh"]
# CMD is often part of the entrypoint script or passed to it.
# If your entrypoint script doesn't have a default command, you might add one here.
# Example: CMD ["default_command_for_entrypoint"]

# Health check (targets the exposed application port)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl --fail http://localhost:4242/api/1/users || exit 1