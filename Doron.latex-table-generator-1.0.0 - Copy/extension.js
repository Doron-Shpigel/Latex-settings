// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "latex-table-generator-new" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('latex-table-generator.helloWorld', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage("There is no TeX file open.");
			return;
		}
		const text = editor.document.getText(editor.selection);
		const [options, ...tableRaw] = text.split(/\s*\n/);
		const table = tableRaw.map(el => el.split(/\s\s/));
		let [colOptions, extraOptions, ...junk] = options.split('#');
		const optionsParams = (colOptions.match(/[clr]/g) || []).length;
		
		if (!text || table.some(row => optionsParams !== row.length) || junk.length) {
			vscode.window.showInformationMessage("Invalid table dimensions or options. Nothing to be done here.");
			return;
		}

		if (!extraOptions) {
			extraOptions = '';
		}

		const [pos] = extraOptions.match(/(?<=(position|pos)\s)[a-zA-Z\!]{1,2}/) || [''];
		const [withlines] = ['1'];//extraOptions.match(/withlines/i) || [''] ||;
		let [caption] = extraOptions.match(/(?<=caption){.*}/) || [''];
		let [centering] = extraOptions.match(/centering/i) || [''];
		let [label] = extraOptions.match(/(?<=label){.*}/) || [''];

		if (centering) {
			centering = `\n\t\\${centering}`;
		}
		if (caption) {
			caption = `\t\\caption${caption}\n`;
		}
		if (label) {
			label = `\t\\label${label}\n`;
		}

		const formattedTable = table.reduce((acc, row) => `${acc + row.join(' & ')} \\\\${withlines ? ' \\hline' : ''}\n\t\t`, '\t\t').trim();

		editor.edit(e => {
			const heading = `\\begin{table}[H]\n\t\\centering`;
			const tabularHeading = `\n\t\\selectlanguage{english}\n\t\\begin{tabular}{ ${colOptions.trim()} }${withlines ? '\n\t\t\\hline' : ''}`;
			const tableContent = `\n\t\t${formattedTable}`;
			const footer = `\n\t\\end{tabular}\n\\selectlanguage{hebrew}\n${caption}${label}\\end{table}`;
			e.replace(editor.selection, heading + tabularHeading + tableContent + footer);
		});

		vscode.window.showInformationMessage("טבלה נוצרה");
	});

	context.subscriptions.push(disposable);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
