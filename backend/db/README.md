# backend/db — owned by Person A

Database client setup and query helpers go here (Prisma client instance, query
functions used by `context.routes.js`). Nothing else in the repo should import
from this folder except Person A's own route file.

See `/prisma/schema.prisma` for the (currently empty) schema this folder will
query against, and `/shared/schemas` + `/shared/fixtures` for the contracts
the query results must match.
