import {
  commands,
  ExtensionContext,
  window,
  workspace,
  WorkspaceConfiguration,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Thenable,
} from 'coc.nvim';

import net from 'net';
import fs from 'fs';
import path from 'path';

import child_process from 'child_process';
import util from 'util';

import which from 'which';

import registerCommands from './commands';
import { pysenLsInstall } from './installer';

const exec = util.promisify(child_process.exec);
let client: LanguageClient;

function useLanguageServerOverTCP(host: string, port: number): ServerOptions {
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      const clientSocket = new net.Socket();
      clientSocket.connect(port, host, () => {
        resolve({
          reader: clientSocket,
          writer: clientSocket,
        });
      });
    });
  };
}

function useLanguageServerOverStdio(pythonPath: string): ServerOptions {
  return {
    command: pythonPath,
    args: ['-m', 'pysen_ls', '--io'],
  };
}

// MEMO: custom
function getPythonPath(config: WorkspaceConfiguration, isRealpath?: boolean): string {
  let pythonPath = config.get<string>('pythonPath', '');
  if (pythonPath) {
    return pythonPath;
  }

  try {
    pythonPath = which.sync('python3');
    if (isRealpath) {
      pythonPath = fs.realpathSync(pythonPath);
    }
    return pythonPath;
  } catch (e) {
    // noop
  }

  try {
    pythonPath = which.sync('python');
    if (isRealpath) {
      pythonPath = fs.realpathSync(pythonPath);
    }
    return pythonPath;
  } catch (e) {
    // noop
  }

  return pythonPath;
}

export async function activate(context: ExtensionContext): Promise<void> {
  const extensionConfig = workspace.getConfiguration('pysen');
  const isEnable = extensionConfig.get<boolean>('enable', true);
  if (!isEnable) return;

  //const outputChannel = window.createOutputChannel('pysen');

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath, { recursive: true });
  }

  const builtinFlake8Version = extensionConfig.get('bultin.flake8Version', '');
  const builtinMypyVersion = extensionConfig.get('bultin.mypyVersion', '');
  const builtinBlackVersion = extensionConfig.get('bultin.blackVersion', '');
  const builtinIsortVersion = extensionConfig.get('bultin.isortVersion', '');

  // Original: config | Change -> clientConfig
  const clientConfig = workspace.getConfiguration('pysen.client');

  let serverOptions: ServerOptions;
  const connectionMode = clientConfig.get<string>('connectionMode');

  // MEMO: Priority to detect pysen-ls
  //
  // 1. pysenLsPath setting
  // 2. Module in the current python3 environment (e.g. venv)
  // 3. builtin pysen-ls (pysen_language_server command)
  let isModule = false;
  let pysenLsPath = extensionConfig.get('pysenLsPath', '');
  if (!pysenLsPath) {
    // MEMO: require, await
    if (await existsEnvPysenLs(getPythonPath(clientConfig))) {
      pysenLsPath = 'dummy';
      isModule = true;
    } else if (
      fs.existsSync(path.join(context.storagePath, 'pysen-ls', 'venv', 'Scripts', 'pysen_language_server.exe')) ||
      fs.existsSync(path.join(context.storagePath, 'pysen-ls', 'venv', 'bin', 'pysen_language_server'))
    ) {
      if (process.platform === 'win32') {
        pysenLsPath = path.join(context.storagePath, 'pysen-ls', 'venv', 'Scripts', 'pysen_language_server.exe');
      } else {
        pysenLsPath = path.join(context.storagePath, 'pysen-ls', 'venv', 'bin', 'pysen_language_server');
      }
    }
  }

  // Install "pysen-ls" if it does not exist.
  if (!pysenLsPath) {
    const isRealpath = true;

    await installWrapper(
      getPythonPath(clientConfig, isRealpath),
      context,
      builtinFlake8Version,
      builtinMypyVersion,
      builtinBlackVersion,
      builtinIsortVersion
    );

    if (process.platform === 'win32') {
      pysenLsPath = path.join(context.storagePath, 'pysen-ls', 'venv', 'Scripts', 'pysen_language_server.exe');
    } else {
      pysenLsPath = path.join(context.storagePath, 'pysen-ls', 'venv', 'bin', 'pysen_language_server');
    }
  }

  // If "pysen-ls" does not exist completely, terminate the process.
  if (!pysenLsPath) {
    window.showErrorMessage('Exit because "pysen-ls" does not exist.');
    return;
  }

  // ---- register command ----

  // MEMO: Add installServer command
  context.subscriptions.push(
    commands.registerCommand('pysen.installServer', async () => {
      const isRealpath = true;

      if (client.serviceState !== 5) {
        await client.stop();
      }
      await installWrapper(
        getPythonPath(clientConfig, isRealpath),
        context,
        builtinFlake8Version,
        builtinMypyVersion,
        builtinBlackVersion,
        builtinIsortVersion
      );
      client.start();
    })
  );
  // original command
  registerCommands(context);

  // ---- /register command ----

  //outputChannel.appendLine(`${'#'.repeat(10)} pysen info\n`);

  switch (connectionMode) {
    case 'stdio':
      if (isModule) {
        const pythonPath = getPythonPath(clientConfig);
        serverOptions = useLanguageServerOverStdio(pythonPath);
        //outputChannel.appendLine('use stdio for the communication (environment module)');
      } else {
        // CUSTOM: pysenLsPath setting or builtin path
        serverOptions = {
          command: pysenLsPath,
          args: ['--io'],
        };
        //outputChannel.appendLine('use stdio for the communication (user setting or builtin)');
      }
      break;
    case 'tcp':
      serverOptions = useLanguageServerOverTCP(
        clientConfig.get<string>('tcpHost', '127.0.0.1'),
        clientConfig.get<number>('tcpPort', 3746)
      );
      //outputChannel.appendLine('use tcp for the communication');
      break;
    default:
      window.showErrorMessage(`unknown connection mode: ${connectionMode}`);
      return;
  }

  const serverConfig = workspace.getConfiguration('pysen.server');
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'python' }],
    outputChannelName: 'pysen LanguageServer',
    initializationOptions: { config: serverConfig },
  };

  client = new LanguageClient('pysen language server', serverOptions, clientOptions);

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

async function installWrapper(
  pythonCommand: string,
  context: ExtensionContext,
  flake8Version?: string,
  mypyVersion?: string,
  blackVersion?: string,
  isortVersion?: string
) {
  const msg = 'Install "pysen-ls"?';
  context.workspaceState;

  let ret = 0;
  ret = await window.showQuickpick(['Yes', 'Cancel'], msg);
  if (ret === 0) {
    try {
      await pysenLsInstall(pythonCommand, context, flake8Version, mypyVersion, blackVersion, isortVersion);
    } catch (e) {
      return;
    }
  } else {
    return;
  }
}

async function existsEnvPysenLs(pythonPath: string): Promise<boolean> {
  const checkCmd = `${pythonPath} -m pysen_ls -h`;
  try {
    await exec(checkCmd);
    return true;
  } catch (error) {
    return false;
  }
}
