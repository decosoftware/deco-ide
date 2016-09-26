## Web

The web module runs in the **renderer process** of Electron. It is a React/Redux web application that is loaded into the `BrowserWindow` by the main process of Electron. The web application implements the bulk of Deco-IDE's functionality.

To start the local web server and hot reload changes run:
```
$ npm run watch
```

#### A few things to note:

- Redux DevTools are available, but are turned off by default in the code. If you would like to turn them on, set the environment variable `NODE_ENV=development`

- Much of the styling is done through `src/styles` .scss files. There are instances of inline styling through React, but much of the major styling happens through compiled SCSS.

- Any font, icon, image, or script required by the web application should be placed in the `assets` folder and will be copied into the `public` folder by running `npm run watch` or `npm run build`

#### Architecture Overview (some parts have been omitted as the source is self-explanatory)

##### Actions
These are the actions in your standard Redux pattern. Redux-thunk and `ipc/request.js` are used
to abstract dispatched actions that call to the main process when they need to handle something (eg. opening a file). Action Types for
requests to the main process are taken from `shared/src/constants` files.
##### Api
The `clients/ModuleClient.js` class is used to communicate with the component registry. At the moment the component registry is very simple — a github project.
For more information on the registry, visit the  [Deco component registry github project.](https://github.com/decosoftware/deco-components)
##### Containers
All action calls and/or use of `mapStateToProps` should be handled by a container. If any child component needs to make an action call then it should
receive that function as a prop from its parent container. If any child components needs access to state in the Redux Store then it should receive it as a prop
from the parent container.
##### Factories
Deco change factory is used to build objects representing state changes in the editor. This allows complex state changes to be handled as a discrete operation through Redux (eg. insert component then undo to reverse the editor to its state before the component was inserted.)
##### Ipc
This is our abstraction layer over Electron's ipc module used to coordinate the main process and the renderer process. The `ipc/ipcActionEmitter.js` is given
access to the Redux Store and listens for events from Electron's ipc module sent over by the main process. Ipc events received are then dispatched as actions and handled in the reducers. A `ipc/Request.js` returns a promise that sends an action through ipc to the main process and then is resolved when the main process completes the action or rejects on error.
##### Middleware
Middleware is how we bring certain CodeMirror events into Redux. It is also a way for us to intercept and modify CodeMirror events before CodeMirror acts on them. Middleware is attached (to listen) to the DecoDoc (A CodeMirror.Doc wrapper) when a document is mounted by the `components/editor/Editor.jsx` component.
##### Models
These are mostly convenience objects used by Factories/Middleware to represent discrete units of the editor's state.
##### Persistence
These are classes used to cache state and/or application metadata using LocalStorage. It also includes some 'actionEmitter' classes that are given access
to the Redux Store. It is similar in concept to `redux-persist` if you are familiar with that project — it is similar in that a portion of state is pushed to a persistence layer so it may later be brought back into the state (asynchronously through the Redux Store) during a new session.
##### Store
The only thing worth noting about how we configure the store is our use of `store/applyActionEmitters` which allows atypical code paths access to the Redux Store. Any class that isn't on the render path should use an actionEmitter to update state through Redux.
