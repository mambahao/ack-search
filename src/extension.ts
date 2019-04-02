import { ExtensionContext, Position, Range, commands, window, workspace } from 'vscode';

import { FileItem } from './FileItem';
import { exec } from 'child_process';

const ce = require('command-exists');

export function activate(context: ExtensionContext) {
  let disposable = commands.registerCommand('extension.ack.search', () => {
    let hasAck: boolean = false;
    let hasAg: boolean = false;
    let hasPt: boolean = false;
    let command = '';

    const rootPath = `${workspace.rootPath}`;

    Promise.all([
      new Promise(resolve => { ce('ack', (err: Error, exists: boolean) => { hasAck = exists; resolve(); }); }),
      new Promise(resolve => { ce('ag', (err: Error, exists: boolean) => { hasAg = exists; resolve(); }); }),
      new Promise(resolve => { ce('pt', (err: Error, exists: boolean) => { hasPt = exists; resolve(); }); })
    ]).then(res => {
      if (hasPt) {
        command = 'pt --nocolor --nogroup';
      } else if (hasAg) {
        command = 'ag --nocolor --nogroup';
      } else if (hasAck) {
        command = 'ack --nocolor --nogroup';
      }

      if (command !== '') {
        // window.showInformationMessage(`Founded install command ${command}`);

        const input = window.createQuickPick<FileItem>();
        input.placeholder = 'Type to search';

        input.onDidChangeValue(value => {
          if(value && value.length > 2) {
            const items: Array<FileItem> = [];
            input.busy = true;

            try {
              exec(`${command} ${value}`, { cwd: rootPath }, (err: Error | null, stdout: string, stderr: string) => {
                const list = stdout.split('\n');
                list.forEach((g) => {
                  if(g.indexOf('* Filename') < 0 && g.indexOf('* Path') < 0 && g.length > 1) {
                    const arr = g.split(':');
                    if(arr && arr.length > 2) {
                      const path = arr[0].trim();
                      const num = arr[1].trim();
                      const code = arr.slice(2).join('').trim().substring(0, 50);

                      items.push(new FileItem(path, parseInt(num), code));
                    }
                  }
                });

                input.items = items;

                input.busy = false;
              });
            } catch(e) {
              input.busy = false;
            }
          } else {
            input.busy = true;
            input.items = [];
            input.busy = false;
          }
        });

        input.onDidChangeSelection(selection => {
          if(selection.length === 1) {
            const sel = selection[0];
            workspace.openTextDocument(`${rootPath}${sel.path.replace('./', '/')}`).then(doc => {
              const line = (sel.num > 0) ? (sel.num - 1) : 0;
              const options = {
                selection: new Range(new Position(line, 0), new Position(line, 0)),
                preview: false
              };
              window.showTextDocument(doc, options);
            });
          }
        });

        input.onDidHide(() => input.dispose());
        input.show();
      } else {
        window.showInformationMessage('Please install Ack Ag or Pt first!');
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
