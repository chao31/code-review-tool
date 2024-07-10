// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CommandCenter } from './commands';
import { GitService } from './gitService';
import { Model } from './model';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let gitService = new GitService(context);
	let model = new Model(context, gitService);

	console.log('Congratulations, your extension "code-review-tool" is now active!');
	new CommandCenter(context, model, gitService);


	// let disposable = vscode.commands.registerCommand('code-review-tool.viewHistory', () => {
	// 	vscode.window.showInformationMessage('Hello World from codeReviewTool!');
	// });

	// context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
