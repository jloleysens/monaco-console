# Console Monaco

This is a toy application that uses webpack to create two bundles:

1. The application code intended for the main thread.
2. The worker code intended for a WebWorker thread.

The worker code is built targeting AMD [per Monaco's requirements](https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html#createwebworker) for a WebWorker module.

In practice, though, bundling with Webpack seems to be sufficient without targeting AMD in tsconfig.

The primary goal of this code is to derisk using the existing Console grammar logic inside of Monaco and to derisk bundling of a worker that we can ship with Kibana.

## How to start

Open two terminals and run the following in each:

```sh
yarn watch
```

```sh
yarn watch:worker
```

Open the `index.html` file in a browser of your choice.

## Strategy for including in Kibana

We can include the `webpack.language-worker.config.js` in a sub-directory inside Kibana and use that to process builds. It is unlikely that this code will change frequently and so we do not have to optimize for the best DX. We can then use `raw-loader` to bundle the worker code along with the rest of the Kibana code. In this way we do not incur any new build dependencies and can also use TypeScript while building out the worker. 

## Future work

The Grammar parser included here can definitely be improved upon. At the moment it is good enough, but if we want to include more sophisticated language diagnostics this script will probably be abandoned for a more sophisticated parser generator.

👆🏻 This will not be a small project and should be scoped out down the line.
