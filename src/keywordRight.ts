import * as vscode from 'vscode';
import * as moment from "moment";
module.exports = function () {
  vscode.commands.executeCommand("workbench.action.files.save").then(() => {
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor && activeTextEditor.document.languageId === 'vso') {
      const { document } = activeTextEditor;

      let characterArray: any = ['⊖ ', '⊙ ', '⊘ '];
      let position: number = activeTextEditor.selection.active.line;
      let current_line: vscode.TextLine = document.lineAt(position);
      let nextLine: vscode.TextLine = document.lineAt(position + 1);
      let unicode_char = characterDecode(characterArray);
      let line_leading_spaces: string = current_line.text.substr(0, current_line.text.indexOf(unicode_char));
      let text_after_unicode_char: string = current_line.text.replace(/[⊙⊘⊖\?]/g, '').trim();
      let date;

      let workspaceEdit = new vscode.WorkspaceEdit();
      //check if the char exists on the line
      if (current_line.text.includes(unicode_char)) {

        if (current_line.text.includes('DONE')) {
          //remove keywords if there are any
          let removeDone = text_after_unicode_char.replace(/\b(DONE)\b/, '').trim();

          //delete the current line
          workspaceEdit.delete(document.uri, current_line.range);
          workspaceEdit.delete(document.uri, nextLine.range);

          //delete the completed line and move all the text below up

          //inset the new text
          workspaceEdit.insert(document.uri, current_line.range.start, line_leading_spaces + unicode_char + removeDone);
          //replace the empty line below
          workspaceEdit.replace(document.uri, new vscode.Range(current_line.range.end, nextLine.range.start), '');
          return vscode.workspace.applyEdit(workspaceEdit).then(() => {
            vscode.commands.executeCommand("workbench.action.files.save");
          });
        } else if (!current_line.text.includes('TODO')) {
          //check if the line doesnt includes TODO
          workspaceEdit.delete(document.uri, current_line.range);
          workspaceEdit.insert(
            document.uri,
            current_line.range.start,
            line_leading_spaces + unicode_char + 'TODO ' + text_after_unicode_char
          );
          return vscode.workspace.applyEdit(workspaceEdit).then(() => {
            vscode.commands.executeCommand("workbench.action.files.save");
          });
        } else if (!current_line.text.includes('DONE')) {
          date = moment().format('Do MMMM YYYY, h:mm:ss a');
          // remove todo from the line
          let text_without_todo = text_after_unicode_char.replace(/\b(TODO)\b/, '').trim();

          workspaceEdit.delete(document.uri, current_line.range);

          workspaceEdit.insert(
            document.uri,
            current_line.range.start,
            line_leading_spaces + unicode_char + 'DONE ' + text_without_todo + '\n   COMPLETED:' + '[' + date + ']'
          );

          return vscode.workspace.applyEdit(workspaceEdit).then(() => {
            vscode.commands.executeCommand("workbench.action.files.save");
          });
        }

      }

      function characterDecode(characterArray: any) {
        const { activeTextEditor } = vscode.window;
        if (activeTextEditor && activeTextEditor.document.languageId === 'vso') {
          const { document } = activeTextEditor;

          let position = activeTextEditor.selection.active.line;
          const getCurrentLine = document.lineAt(position);
          let currentLineText = getCurrentLine.text;

          for (let i = 0; i < characterArray.length; i++) {
            if (currentLineText.includes(characterArray[i])) {
              return characterArray[i];
            }
          }
        }
      }
    }
  });
};
