# coc-pysen

> fork from a [bonprosoft/pysen-vscode](https://github.com/bonprosoft/pysen-vscode)

[pysen-ls](https://pypi.org/project/pysen-ls/) ([pysen](https://github.com/pfnet/pysen) language server) extension for [coc.nvim](https://github.com/neoclide/coc.nvim).

Python linting, formatting made easy.

<img width="780" alt="coc-pysen-demo" src="https://user-images.githubusercontent.com/188642/114372002-0d0c5100-9bbc-11eb-9196-20a986887dee.gif">

## Note

Due to the nature of the tool, it may take some time for the formatter to complete its execution.

You may want to refrain from setting up automatic formatting when saving files.

## Install

**CocInstall**:

```vim
:CocInstall @yaegassy/coc-pysen
```

> scoped packages

**vim-plug**:

```vim
Plug 'yaegassy/coc-pysen', {'do': 'yarn install --frozen-lockfile'}
```

## Require: pyproject.toml

To run linter and formatter in "pysen", you need `pyproject.toml`.

**e.g. pyproject.toml**:

```toml
[tool.pysen]
version = "0.10"

[tool.pysen.lint]
enable_black = true
enable_flake8 = true
enable_isort = true
enable_mypy = true
mypy_preset = "strict"
line_length = 88
py_version = "py37"
[[tool.pysen.lint.mypy_targets]]
  paths = ["."]
```

**More Info**:

Check the README of "pysen".

- [Quickstart: Set up linters using pysen](https://github.com/pfnet/pysen#quickstart-set-up-linters-using-pysen)
- [Frequently Asked Questions](https://github.com/pfnet/pysen#frequently-asked-questions)

## Detect: pysen-ls

`coc-pysen` detects and starts `pysen-ls`.

**Priority to detect**:

1. `pysen.pysenLsPath`
2. current python3 environment (e.g. pysen-ls in venv)
3. builtin pysen-ls (Installation commands are also provided)

## Bult-in install

coc-pysen allows you to create an extension-only "venv" and install "pysen-ls".

Also install flake8, mypy, black, and isort together.

You can also specify the version of each tool. (setting: `pysen.bultin.flake8Version`, `pysen.bultin.mypyVersion`, `pysen.bultin.blackVersion`, `pysen.bultin.isortVersion`)

----

The first time you use coc-pysen, if pysen-ls is not detected, you will be prompted to do a built-in installation.

You can also run the installation command manually.

```
:CocComannd pysen.installServer
```

## Configuration options

- `pysen.enable`: Enable coc-pysen extension, default: `true`
- `pysen.pysenLsPath`: (Optional) The custom path to the pysen-ls (Absolute path)
- `pysen.bultin.flake8Version`: (Optional) Version of flake8 for built-in install, e.g. "3.9.0", default: `""`
- `pysen.bultin.mypyVersion`: (Optional) Version of mypy for built-in install, e.g. "0.812", default: `""`
- `pysen.bultin.blackVersion`: (Optional) Version of black for built-in install, e.g. "20.8b1", default: `""`
- `pysen.bultin.isortVersion`: (Optional) Version of isort for built-in install, e.g. "5.8.0", default: `""`
- `pysen.client.connectionMode`: Controls the communication method to pysen-ls, valid options `["stdio", "tcp"]`, default: `"stdio"`
  - `stdio`: Use stdio to communicate with pysen-ls.
  - `tcp`: Use tcp to connect pysen-ls. You need to launch pysen-ls.
- `pysen.client.pythonPath`: (Optional) Specifies the python path to use pysen, default: `""`
- `pysen.client.tcpHost`: Specifies the host name to connect pysen-ls server. This setting only works with connectionMode is 'tcp', default: `127.0.0.1`
- `pysen.client.tcpPort`: Specifies the port to connect pysen-ls server. This setting only works with connectionMode is 'tcp', default: `3746`
- `pysen.server.enableLintOnSave`: Controls whether to trigger the lint task on save, default: `true`
- `pysen.server.enableCodeAction`: Enable/disable code actions, default: `true`
- `pysen.server.lintTargets`: Controls target names for pysen to invoke in the lint task, default: `["lint"]`
- `pysen.server.formatTargets`: Controls target names for pysen to invoke in the format task, default: `["format", "lint"]`
- `pysen.trace.server`: Traces the communication between coc.nvim and the pysen language server, default: `"off"`

## Commands

- `pysen.installServer`: Install pysen-ls (builtin)
  - It will be installed in this path:
    - Mac/Linux: `~/.config/coc/extensions/@yaegassy/coc-pysen-data/pysen-ls/venv/bin/pysen_language_server`
    - Windows: `~/AppData/Local/coc/extensions/@yaegassy/coc-pysen-data/pysen-ls/venv/bin/pysen_language_server`
- `pysen.triggerLintDocument`: Lint Current Document
- `pysen.triggerLintWorkspace`: Lint Entire Workspace
- `pysen.triggerFormatDocument`: Format Current Document
- `pysen.triggerFormatWorkspace`: Format Entire Workspace
- `pysen.triggerFormatWorkspace`: Format Entire Workspace

## What's "pysen"

- Blog post
  - (English)
    - <https://tech.preferred.jp/en/blog/pysen-is-the-new-sempai/>
  - (Japanese)
    - <https://tech.preferred.jp/ja/blog/pysen-is-the-new-sempai/>

## Simlar vim plugins

- [bonprosoft/pysen.vim](https://github.com/bonprosoft/pysen.vim)

## Thanks

- [pfnet/pysen](https://github.com/pfnet/pysen)
- [bonprosoft/pysen-ls](https://github.com/bonprosoft/pysen-ls)
- [bonprosoft/pysen-vscode](https://github.com/bonprosoft/pysen-vscode)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
