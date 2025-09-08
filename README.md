# Sistema de Anotações com Google Apps Script
Este projeto é uma aplicação web de página única (SPA - Single Page Application) para gerenciar anotações, utilizando Google Sheets como banco de dados e Google Apps Script como backend.

Visão Geral da Arquitetura
Frontend: Um único arquivo index.html que contém a estrutura (HTML), a estilização (CSS) e o comportamento (JavaScript) da interface do usuário. A aplicação é totalmente renderizada no lado do cliente.

Backend: Um arquivo Code.gs (Google Apps Script) que atua como uma API, respondendo às solicitações do frontend. Ele é responsável por toda a lógica de negócios, incluindo acesso e manipulação de dados na planilha Google.

Banco de Dados: Uma planilha Google (Google Sheets) onde os dados são armazenados de forma estruturada em diferentes abas (ex: PESSOAS, ANOTACOES, USUARIOS).

Comunicação: A comunicação entre o frontend (JavaScript) e o backend (Apps Script) é feita de forma assíncrona através da API google.script.run.

Como Funciona
Carregamento Inicial:

Quando o usuário acessa a URL do web app, o Google Apps Script serve o arquivo index.html.

O script no index.html é executado, chamando a função initializeUserEmail() para obter o e-mail do usuário logado e verificar suas permissões na aba USUARIOS da planilha.

Fluxo de Navegação:

Tela Principal (mainPanel): Exibe uma lista de "pessoas", carregada da aba PESSOAS da planilha. Cada pessoa é um botão clicável.

Tela de Anotações (notesPanel): Ao clicar em uma pessoa, a aplicação chama a função loadNotesForPerson(personName) no backend. Essa função busca todas as anotações associadas àquela pessoa na aba ANOTACOES e as retorna para o frontend, que as renderiza na tela. O backend também verifica se o usuário logado tem permissão para editar as anotações daquela pessoa.

Formulário de Anotação (noteFormPanel): Permite registrar uma nova anotação ou editar uma existente. Ao salvar, os dados são enviados para as funções registerNote() ou editNote() no backend, que atualizam a planilha.

Funcionalidades Principais:

CRUD de Anotações: O usuário pode criar, ler, e atualizar anotações. A exclusão não está implementada neste código.

Controle de Permissão: O backend verifica se o usuário (identificado pelo e-mail) tem permissão para registrar/editar anotações para uma determinada pessoa, com base na aba USUARIOS.

Ordenação (Arrastar e Soltar): A biblioteca SortableJS é usada para permitir que o usuário reordene as anotações. Quando o usuário salva a nova ordem, um array com os IDs únicos das anotações é enviado para a função saveNoteOrder() no backend, que reescreve os dados na planilha para refletir a nova ordenação.

Modal de Visualização: Um modal é usado para exibir o conteúdo completo de uma anotação sem sair da lista.

Tecnologias Utilizadas
HTML5: Estrutura da página.

CSS3: Estilização avançada com Flexbox, Grid, gradientes e animações para uma interface moderna.

JavaScript (Vanilla): Manipulação do DOM, lógica da interface, e chamadas assíncronas para o backend.

Google Apps Script: Lógica de servidor para interagir com os serviços do Google (especificamente, Google Sheets).

SortableJS: Biblioteca JavaScript para a funcionalidade de arrastar e soltar.
