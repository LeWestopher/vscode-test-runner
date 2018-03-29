import * as vscode from 'vscode';
import * as path from 'path';
import { TestSuiteFile } from './test-suite-file';
import { TestSuiteAssertionResult } from './test-suite-assertion-result';

export interface ITestSuiteFileMetaData {
	endTime?: number;
	message?: string;
	name?: string;
	startTime?: number;
	status?: string;
	summary?: string;
	assertionResults: TestSuiteAssertionResult[]
}

export interface IAssertionResult {
	fullName: string;
	status: string;
	title: string;
	ancestorTitles: string[];
	failureMessages: string[]
	location: ITestLocation;
}

export interface ITestLocation {
	column: number;
	line: number;
}

export class TestSuiteProvider implements vscode.TreeDataProvider<TestSuiteFile | TestSuiteAssertionResult> {

	public cmd = './node_modules/.bin/jest';

	private _onDidChangeTreeData: vscode.EventEmitter<TestSuiteFile | undefined> 
		= new vscode.EventEmitter<TestSuiteFile | undefined>();

	readonly onDidChangeTreeData: vscode.Event<TestSuiteFile | undefined> 
		= this._onDidChangeTreeData.event;

	private _results: any;

	get forRoot() {
		if (!this._results) {
			return [];
		}
		const { Collapsed, Expanded } = vscode.TreeItemCollapsibleState;
		return this._results
			.testResults
			.sort(result => result.status === 'passed' ? 1 : -1)
			.map(result => {
				const fn = result.name.split('/');
				const collapsibleState = result.status === 'passed' ? 
					Collapsed :
					Expanded;
				return new TestSuiteFile(fn[fn.length - 1], collapsibleState, result)
			})

	}

	constructor(private workspaceRoot: string) {
		this.refresh();
		
		const ongoingTestsProcess = this.spawnOngoingTestsProcess(
			this.cmd, 
			['--json', '--testLocationInResults', '--watchAll', '--coverage'], 
			this.workspaceRoot 
		);

		const pendingTestsProcess = this.spawnPendingTestsProcess(
			this.cmd,
			['--listTests', '--verbose'],
			this.workspaceRoot
		)

	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: TestSuiteFile): vscode.TreeItem {
		return element;
	}

	getChildren(element?: TestSuiteFile | TestSuiteAssertionResult): Thenable<TestSuiteFile[] | TestSuiteAssertionResult[]> {
    return new Promise(resolve => {
			if (!element) {
				return resolve(this.forRoot)
			}
			return resolve(element.meta.assertionResults
				.sort(result => result.status !== 'passed' ? -1 : 1)
				.map(assertionResult => new TestSuiteAssertionResult(
					assertionResult.fullName, 
					vscode.TreeItemCollapsibleState.None, assertionResult
				))
			)
		})
	}

	private parsePendingTestResults(consoleString: string) {
		return consoleString
			.split('\n')
			.filter(name => !!name)
			.map(fullPath => ({
				status: 'pending',
				name: fullPath,
				assertionResults: []
			}))
	}

	private spawnPendingTestsProcess(cmd: string, args: Array<string>, cwd: string) {
		const { spawn } = require('child_process')
		const listChild = spawn(cmd, args, { cwd });

		listChild.stdout.on('data', data => {
			let mockFile: ITestSuiteFileMetaData = {
				assertionResults: []
			};
			this._results = this._results || {};
			this._results.testResults = this.parsePendingTestResults(data.toString())
			this.refresh();
			listChild.kill();
		});
	}

	private spawnOngoingTestsProcess(cmd: string, args: Array<string>, cwd: string) {
		const { spawn } = require('child_process');
		const child = spawn(cmd, args, { cwd });

		child.stdout.on('data', data => {
			this._results = JSON.parse(data.toString());
			this.refresh();
		});

		child.stderr.on('data', data => {
			console.log(data.toString());
		})

	}
}



