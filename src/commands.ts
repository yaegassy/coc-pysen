import { commands, ExtensionContext, workspace } from 'coc.nvim';

//function invokeRemoteCommandWithActiveDocument(commandName: string) {
async function invokeRemoteCommandWithActiveDocument(commandName: string) {
  // MEMO: window.activeTextEditor is not implemented in coc.nvim
  //const activeEditor = window.activeTextEditor;
  //if (!activeEditor) {
  //  window.showErrorMessage('No document opened');
  //  return;
  //}

  //const activeDocument = activeEditor.document;
  const doc = await workspace.document;
  //commands.executeCommand(commandName, activeDocument.uri.toString());
  commands.executeCommand(commandName, doc.uri.toString());
}

export default function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('pysen.triggerLintDocument', () => {
      invokeRemoteCommandWithActiveDocument('pysen.callLintDocument');
    })
  );

  context.subscriptions.push(
    commands.registerCommand('pysen.triggerFormatDocument', () => {
      invokeRemoteCommandWithActiveDocument('pysen.callFormatDocument');
    })
  );

  context.subscriptions.push(
    commands.registerCommand('pysen.triggerLintWorkspace', () => {
      commands.executeCommand('pysen.callLintWorkspace');
    })
  );

  context.subscriptions.push(
    commands.registerCommand('pysen.triggerFormatWorkspace', () => {
      commands.executeCommand('pysen.callFormatWorkspace');
    })
  );
}
