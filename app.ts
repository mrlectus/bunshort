import { URL } from "url";
import { db } from "./db";

const LINK = `
CREATE TABLE IF NOT EXISTS Links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link TEXT NOT NULL UNIQUE
);
`;

type TLink = {
  id: number;
  link: string;
};

Bun.serve({
  fetch(req) {
    const path = new URL(req.url);
    db.query(LINK).run();
    switch (req.method) {
      case "GET": {
        switch (path.pathname) {
          case "/v1/short": {
            const url = path?.searchParams.get("url");
            if (!url)
              return Response.json(
                { message: "please provide url/link" },
                {
                  status: 400,
                }
              );
            try {
              const result = db.prepare(
                "INSERT INTO Links (link) VALUES(?) RETURNING *",
                [url]
              );
              const user = result.get() as TLink;
              return Response.json({ link: `bunshort.ly/${user.id}` });
            } catch (error) {
              return Response.json({
                message: `cannot insert into database`,
              });
            } finally {
            }
          }
          default: {
            const id = Number(path.pathname.split("/").pop());
            if (isNaN(id)) {
              return Response.json(
                { message: "id not a number" },
                { status: 400 }
              );
            } else {
              try {
                const query = db.prepare("SELECT * FROM Links WHERE id = ?");
                const result = query.get(id) as TLink;
                console.log(result.link);
                return Response.redirect(result.link, 301);
              } catch (error) {
                console.log(error);
                return Response.json(
                  { message: "id not found" },
                  { status: 404 }
                );
              } finally {
              }
            }
          }
        }
      }
      case "POST": {
        switch (path.pathname) {
          case "/v1/short": {
            return Response.json({ message: "Ok" });
          }
        }
      }
    }
    return Response.json({ text: "Ok" });
  },
  port: 9201,
});
