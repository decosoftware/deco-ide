## Shared

The `shared` module is aliased to both `desktop/shared` and `web/shared` by webpack. The `shared/constants/ipc` files represent Action Type constants used to
communicate over our promise-based Electron `ipc` module abstraction layer.

In the future it may be that other constants or functionality should be shared between the `desktop` and `web` modules. They should go here too.
You can think of `shared` as analogous to "universal" code.
