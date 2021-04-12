import { commands, ExtensionContext } from 'coc.nvim';

export default function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('pysen.triggerLintDocument', () => {
      commands.executeCommand('pysen.callLintDocument');
    })
  );

  context.subscriptions.push(
    commands.registerCommand('pysen.triggerFormatDocument', () => {
      commands.executeCommand('pysen.callFormatDocument');
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
