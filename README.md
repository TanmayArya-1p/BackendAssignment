# InOrder

**A Restaurant Order Management System**

## Setup and Installation

Prerequisites : [docker](https://www.docker.com)


### Clone the Repository

```bash
git clone https://github.com/TanmayArya-1p/MVCAssignment
```

### Configuring Environment Variables

  - Create a `.env` file in the root of the project.
  - Here is a template for the `.env` file :


    ```bash
    MYSQL_HOST="db"
    MYSQL_PORT=3306
    MYSQL_USER="<username>"
    MYSQL_PASSWORD="<password>"
    PORT=3000
    JWT_SECRET_KEY="<jwt-secret>"
    REFRESH_TOKEN_EXPIRE=86400
    AUTH_TOKEN_EXPIRE=3600
    DEFAULT_ADMIN_PASSWORD="admin"
    ```

  - Now configure the environment variables for the `mysql` service in the `compose.yml` file :


    ```bash
    environment:
    - MYSQL_PORT=3306
    - MYSQL_USER=tanmay
    - MYSQL_PASSWORD=password
    - MYSQL_ROOT_PASSWORD=rootpassword
    - MYSQL_DATABASE=mvc
    ```

    Change the `MYSQL_USER` and the `MYSQL_PASSWORD` to same values configured previously in the `.env` file.


### Run with docker compose
```bash
docker compose up -d
```
  InOrder should now be running on `localhost:4000` !



***By Default the `admin` user has the password `admin`. This password can be changed in the `.env` file.***

## Using an API Client

To use an API Client you can either import [openapi.json](https://raw.githubusercontent.com/TanmayArya-1p/MVCAssignment/refs/heads/main/openapi.json) definitions into your client or access the generated Swagger documentation at `/api/swagger` .


Also if you're using [yaak](https://yaak.app) then u can directly import [yaak.json](https://raw.githubusercontent.com/TanmayArya-1p/MVCAssignment/refs/heads/main/yaak.json)
