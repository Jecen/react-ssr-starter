import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import expressJwt, { UnauthorizedError as Jwt401Error } from "express-jwt";
import router from "./router";
import React from "react";
import ReactDOM from "react-dom/server";
import App from "components/App";
import Html from "components/Html";
import path from "path";
import chunks from './chunk-manifest.json';
import nodeFetch from 'node-fetch'
import Http from './http'
import history from './history'

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
  // send entire app down. Process manager will restart it
  process.exit(1);
});

global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || "all";

const app = express();

app.use(express.static(path.resolve(__dirname, "../dist")));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// pase
app.get("*", async (req, res, next) => {
  try {
    const css = new Set();

    const insertCss = (...styles) => {
      styles.forEach(style => css.add(style._getCss()));
    };
    const cookie = req.headers.cookie
    const context = {
      insertCss,
      pathname: req.path,
      query: req.query,
      fetch: Http(nodeFetch, {
        conf: {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(cookie ? {
              Cookie: cookie
            } : null),
          },
        }
      }),
    };

    const route = await router.resolve(context);
    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };
    data.children = ReactDOM.renderToString(
      <App context={context}>{route.component}</App>
    );
    data.styles = [{ id: "css", cssText: [...css].join("") }];

    const scripts = new Set();
    const addChunk = chunk => {
      if (chunks[chunk]) {
        chunks[chunk].forEach(asset => scripts.add(asset));
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`);
      }
    };
    addChunk("client");
    if (route.chunk) addChunk(route.chunk);
    if (route.chunks) route.chunks.forEach(addChunk);

    data.scripts = Array.from(scripts);
    data.app = {
      apiUrl: ""
    };
   const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}>
     {err}
    </Html>
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

if (!module.hot) {
  app.listen('3001', () => {
    console.info(`The server is running at http://localhost:3001/`);
  });
}

if (module.hot) {
  app.hot = module.hot;
  module.hot.accept("./router");
}

export default app;
