// VARIÁVEIS GLOBAIS
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAME_BD = "BD"; // Nome da aba onde as anotações são armazenadas
const SHEET_NAME_USUARIOS = "USUARIOS"; // Nova aba para mapear nomes e e-mails

// Nomes das pessoas que estarão nas anotações
const PEOPLE_NAMES = [
  "Pessoa 1", "Pessoa 2", "Pessoa 3"
];

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Sistema de Anotações')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getOrgIdColumnIndex() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_BD);
  if (!sheet) return -1;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const orgIdColIndex = headers.indexOf('ID Organizador');
  return orgIdColIndex;
}

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Sistema de Anotações')
      .addItem('Abrir Painel', 'openNotesSystem')
      .addToUi();
}

function openNotesSystem() {
  const htmlOutput = HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Sistema de Anotações')
      .setWidth(1000)
      .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, htmlOutput.getTitle());
}

function getCurrentUserEmail() {
  return Session.getActiveUser().getEmail();
}

function getPersonNameByEmail(email) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_USUARIOS);
    if (!sheet) return null;
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const nameColIndex = headers.indexOf('Nome');
    const emailColIndex = headers.indexOf('Email');
    if (nameColIndex === -1 || emailColIndex === -1) return null;

    const trimmedEmail = email.trim().toLowerCase();
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] && data[i][emailColIndex].trim().toLowerCase() === trimmedEmail) {
        return data[i][nameColIndex].trim();
      }
    }
    return null;
  } catch (e) {
    Logger.log("Erro ao buscar nome por e-mail: " + e.message);
    return null;
  }
}

function getPeopleList() {
  return [...new Set(PEOPLE_NAMES)].sort();
}

function registerNote(personName, title, content) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_BD);
    if (!sheet) throw new Error(`A aba "${SHEET_NAME_BD}" não foi encontrada.`);
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Pessoa', 'Titulo', 'Conteudo', 'ID Unico', 'ID Organizador']);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const personColIndex = headers.indexOf('Pessoa');
    const orgIdColIndex = headers.indexOf('ID Organizador');

    const allData = sheet.getDataRange().getValues();
    let maxOrgId = 0;
    for(let i = 1; i < allData.length; i++) {
        if (allData[i][personColIndex] === personName) {
            const currentOrgId = parseInt(allData[i][orgIdColIndex], 10);
            if (!isNaN(currentOrgId) && currentOrgId > maxOrgId) {
                maxOrgId = currentOrgId;
            }
        }
    }
    const nextOrgId = maxOrgId + 1;
    
    const uniqueId = Utilities.getUuid();

    sheet.appendRow([personName, title, content, uniqueId, nextOrgId]);
    return { success: true, message: "Anotação registrada com sucesso!" };
  } catch (e) {
    Logger.log("Erro ao registrar anotação: " + e.message);
    return { success: false, message: "Erro ao registrar anotação: " + e.message };
  }
}

function getNotesByPerson(personName, currentUserEmail) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_BD);
    if (!sheet || sheet.getLastRow() < 2) return { notes: [], canEdit: false };

    const ownerNameOfCurrentUser = getPersonNameByEmail(currentUserEmail);

    Logger.log(`Verificando permissão: Dono encontrado para o email ('${currentUserEmail}') é '${ownerNameOfCurrentUser}'. Painel acessado é '${personName}'.`);
    
    const canEdit = (ownerNameOfCurrentUser && personName && ownerNameOfCurrentUser.trim().toLowerCase() === personName.trim().toLowerCase());
    Logger.log(`Resultado da verificação 'canEdit': ${canEdit}`);

    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = values.shift(); 

    const colIdx = {
      person: headers.indexOf('Pessoa'),
      title: headers.indexOf('Titulo'),
      content: headers.indexOf('Conteudo'),
      uniqueId: headers.indexOf('ID Unico'),
      orgId: headers.indexOf('ID Organizador')
    };

    if (Object.values(colIdx).some(idx => idx === -1)) {
      throw new Error("Uma ou mais colunas necessárias (Pessoa, Titulo, Conteudo, ID Unico, ID Organizador) não foram encontradas.");
    }

    const notes = values.map((row, index) => {
      if (row[colIdx.person] && personName && row[colIdx.person].trim().toLowerCase() === personName.trim().toLowerCase()) {
        return {
          title: row[colIdx.title] || 'Sem Título',
          content: row[colIdx.content] || 'Sem conteúdo.',
          row: index + 2,
          isOwner: canEdit,
          uniqueId: row[colIdx.uniqueId],
          orgId: row[colIdx.orgId]
        };
      }
      return null;
    }).filter(note => note !== null);

    notes.sort((a, b) => a.orgId - b.orgId);
    
    const debugInfo = {
      email: currentUserEmail,
      ownerFoundForEmail: ownerNameOfCurrentUser,
      panelAccessed: personName,
      canEditResult: canEdit
    };
    
    return { notes: notes, canEdit: canEdit, debug: debugInfo };
  } catch (e) {
    Logger.log("Erro ao obter anotações para " + personName + ": " + e.message);
    return { notes: [], canEdit: false, error: e.message };
  }
}

function editNote(row, newTitle, newContent) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_BD);
    if (!sheet) throw new Error(`A aba "${SHEET_NAME_BD}" não foi encontrada.`);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const titleCol = headers.indexOf('Titulo') + 1;
    const contentCol = headers.indexOf('Conteudo') + 1;

    if (titleCol === 0 || contentCol === 0) {
      throw new Error("As colunas 'Titulo' ou 'Conteudo' não foram encontradas.");
    }

    sheet.getRange(row, titleCol).setValue(newTitle);
    sheet.getRange(row, contentCol).setValue(newContent);

    return { success: true, message: "Anotação atualizada com sucesso!" };
  } catch (e) {
    Logger.log("Erro ao editar anotação na linha " + row + ": " + e.message);
    return { success: false, message: "Erro ao editar anotação: " + e.message };
  }
}

function saveNoteOrder(orderedUniqueIds) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_BD);
    if (sheet.getLastRow() < 2) return { success: true, message: "Nenhuma anotação para ordenar." };

    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = values.shift();
    const uniqueIdColIndex = headers.indexOf('ID Unico');
    const orgIdColIndex = headers.indexOf('ID Organizador');

    if (uniqueIdColIndex === -1 || orgIdColIndex === -1) {
      throw new Error("As colunas 'ID Unico' ou 'ID Organizador' não foram encontradas.");
    }

    const idMap = {};
    values.forEach((row, index) => {
      const uniqueId = row[uniqueIdColIndex];
      if (uniqueId) {
        idMap[uniqueId] = index;
      }
    });

    orderedUniqueIds.forEach((uniqueId, newOrderIndex) => {
      if (idMap.hasOwnProperty(uniqueId)) {
        const rowIndex = idMap[uniqueId];
        values[rowIndex][orgIdColIndex] = newOrderIndex + 1;
      }
    });

    sheet.getRange(2, 1, values.length, values[0].length).setValues(values);

    return { success: true, message: "Ordem salva com sucesso!" };
  } catch (e) {
    Logger.log("Erro ao salvar a ordem das anotações: " + e.message);
    return { success: false, message: "Erro ao salvar a ordem: " + e.message };
  }
}
