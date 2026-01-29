FROM migrate/migrate:v4.19.1

RUN apk add --no-cache bash

WORKDIR /migrations

COPY . .

ENTRYPOINT ["sh", "-c"]
CMD ["/migrations/dockerfile-init.sh"]
