# T4SG × Disaster Tech Labs

## Setup

#### Clone repository

`cd` into a desired destination folder and clone the repo:

```
git clone git@github.com:Wolfiej-k/f24-eng-disastertech.git
```

#### Start containers

The full application has multiple components (frontend, backend, LLM, and database), which we containerize into isolated Linux systems with [Docker](https://www.docker.com/). To run the production server, install the Docker service and run:

```shell
docker-compose build
docker-compose up
```

Verify that `app`, `api`, `llama`, and `database` launch without error and the Llama model begins downloading. As configured in [app.Dockerfile](app.Dockerfile), the Next.js server should be live at http://127.0.0.1:3000. The Flask, llama.cpp, and PostgreSQL servers should also be live at http://api:4000, http://lama:8080, and http://postgres:5432, respectively, but these are only exposed within the Docker network. In the future, **unless you modify the source code**, you can just run `docker-compose up`.

#### HTTPS deployment

For real-world use, the Next.js server should be accessible from a custom domain via HTTPS, i.e., port 443. See [this answer](https://stackoverflow.com/questions/74185594/how-to-deploy-a-next-js-app-on-https-ssl-connection-with-docker) for an example solution using nginx.

## Stack

- [Next.js](https://nextjs.org/docs)
- [Tailwind](https://tailwindcss.com/docs/installation)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Flask](https://flask.palletsprojects.com/en/3.0.x/)
- [llama.cpp](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md)
- [PostgreSQL](https://www.postgresql.org/docs/current/tutorial.html)
- [pgvector](https://github.com/pgvector/pgvector)
