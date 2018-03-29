import * as vscode from 'vscode';

import { TestSuiteProvider } from './test-runner-view'

export function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.rootPath;
	const jestTestSuiteProvider = new TestSuiteProvider(rootPath);
	vscode.window.registerTreeDataProvider('jestTestRunner', jestTestSuiteProvider);
	vscode.commands.registerCommand('jestTestRunner.refreshEntry', () => jestTestSuiteProvider.refresh());
}