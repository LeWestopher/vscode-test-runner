import vscode from 'vscode'
import * as path from 'fs'

export interface IIconPath {
	light: string;
	dark: string;
}

export class TestSuiteAssertionResult extends vscode.TreeItem {

	iconPath: IIconPath

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public meta: IAssertionResult,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		const key = {
			passed: 'success.svg',
			failed: 'failure.svg',
			pending: 'pending.svg'
		};
		let svg = key[this.meta.status];
		this.iconPath = {
			light: path.join(__filename, '..', '..', 'resources', svg),
			dark: path.join(__filename, '..', '..', 'resources', svg),
		}
	}
}