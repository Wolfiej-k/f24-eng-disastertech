# T4SG × Disaster Tech Labs

## Setup

#### Clone repository

`cd` into a desired destination folder and clone the repo:

```
git clone git@github.com:Wolfiej-k/f24-eng-disastertech.git
```

#### Enable tooling

Open the project folder in VS Code. You can do so with this useful shortcut:

```shell
cd f24-eng-disastertech
code .
```

You should see a popup in the bottom right prompting you to install recommended extensions. Please install these, as they'll be helpful for code formatting and developing the webapp. You can also view the recommended extensions in the extensions sidebar (`cmd + shift + X`).

Accept the prompt to use the workspace's TypeScript version. You may have to navigate to any `.ts` or `.tsx` file in the project and open it to receive the prompt. If you don't get one, or if you get an error that the path "does not point to a valid tsserver install," make sure you're using the workspace's TypeScript version: press `cmd + shift + P` type "typescript," select `TypeScript: Select TypeScript Version`, and select `Use Workspace Version`.

#### Install packages

To develop the frontend, we recommend you install dependencies to your local OS (for instance, to avoid TypeScript warnings and enable hot-reloading). Open a terminal in the project folder by dragging up from the bottom of the code window or by going to `Terminal > New Terminal` in the menu bar. Run `npm install`, or `npm i` for short.

- If you get something like "command not found," you might not have npm installed.
- If successful, you should see something like:

  ```shell
  added 414 packages, and audited 415 packages in 13s

  149 packages are looking for funding
  run `npm fund` for details

  found 0 vulnerabilities
  ```

Run `npm run dev`, which should launch the Next.js server.

#### Launch containers

The full application has multiple components (frontend, backend, LLM, and database), which we containerize into isolated Linux systems with [Docker](https://www.docker.com/). To run the development server, install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and run:

```shell
docker-compose build
docker-compose up
```

Verify that `app`, `api`, `llama`, and `database` launch without error, and the Llama model begins downloading. The Next.js server should be live at http://localhost:3000 and the Flask backend at http://localhost:4000. The llama.cpp and Postgres servers should also be live at http://llama:8080 and http://postgres:5432, respectively, but these are only exposed within the Docker network. In the future, **unless you install dependencies**, you can just run `docker-compose up`.

## Stack

- [Next.js](https://nextjs.org/docs)
- [Tailwind](https://tailwindcss.com/docs/installation)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Flask](https://flask.palletsprojects.com/en/3.0.x/)
- [llama.cpp](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md)
- [PostgreSQL](https://www.postgresql.org/docs/current/tutorial.html)
- [pgvector](https://github.com/pgvector/pgvector)
