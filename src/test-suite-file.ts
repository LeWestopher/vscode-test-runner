import * as vscode from 'vscode';

export class TestSuiteFile extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public meta: any,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		console.log(path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'));
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg')
	}; 

	// contextValue = 'dependency'; 

}