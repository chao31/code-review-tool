import * as vs from 'vscode';

interface Command {
  id: string;
  method: Function;
}

const Commands: Command[] = [];

function command(id: string) {
    return function (_target: any, _key: string, descriptor: PropertyDescriptor) {
        console.log(3333);
        if (!(typeof descriptor.value === 'function')) {
            throw new Error('not supported');
        }
        Commands.push({ id, method: descriptor.value });
    };
}

export class CommandCenter {
  constructor(
    context: vs.ExtensionContext,
  ) {
    context.subscriptions.push(
      ...Commands.map(({ id, method }) => {
        return vs.commands.registerCommand(id, (...args: any[]) => {
          Promise.resolve(method.apply(this, args));
        });
      })
    );
  }

  @command('code-review-tool.viewHistory')
  async viewHistory(): Promise<void> {
    vs.window.showInformationMessage('Hello World from codeReviewTool!');
  }
}
