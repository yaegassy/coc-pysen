import { ExtensionContext, window } from 'coc.nvim';

import path from 'path';

import rimraf from 'rimraf';
import child_process from 'child_process';
import util from 'util';

import { PYSEN_LS_VERSION } from './constant';

const exec = util.promisify(child_process.exec);

export async function pysenLsInstall(
  pythonCommand: string,
  context: ExtensionContext,
  flake8Version?: string,
  mypyVersion?: string,
  blackVersion?: string,
  isortVersion?: string
): Promise<void> {
  const pathVenv = path.join(context.storagePath, 'pysen-ls', 'venv');

  let pathVenvPython = path.join(context.storagePath, 'pysen-ls', 'venv', 'bin', 'python');
  if (process.platform === 'win32') {
    pathVenvPython = path.join(context.storagePath, 'pysen-ls', 'venv', 'Scripts', 'python');
  }

  const statusItem = window.createStatusBarItem(0, { progress: true });
  statusItem.text = `Install pysen-ls and more tools...`;
  statusItem.show();

  const installFlake8Str = _installToolVersionStr('flake8', flake8Version);
  const installMypyStr = _installToolVersionStr('mypy', mypyVersion);
  const installBlackStr = _installToolVersionStr('black', blackVersion);
  const installIsortStr = _installToolVersionStr('isort', isortVersion);

  const installCmd =
    `python3 -m venv ${pathVenv} && ` +
    `${pathVenvPython} -m pip install -U pip pysen-ls==${PYSEN_LS_VERSION} ${installFlake8Str} ${installMypyStr} ${installBlackStr} ${installIsortStr}`;

  rimraf.sync(pathVenv);
  try {
    window.showMessage(`Install pysen-ls and more tools...`);
    await exec(installCmd);
    statusItem.hide();
    window.showMessage(`pysen-ls: installed!`);
  } catch (error) {
    statusItem.hide();
    window.showErrorMessage(`pysen-ls: install failed. | ${error}`);
    throw new Error();
  }
}

function _installToolVersionStr(name: string, version?: string): string {
  let installStr: string;

  if (version) {
    installStr = `${name}==${version}`;
  } else {
    installStr = `${name}`;
  }

  return installStr;
}
