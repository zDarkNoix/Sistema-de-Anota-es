# Sistema de Anotações com Google Apps Script
Este projeto é uma aplicação web de página única (SPA - Single Page Application) para gerenciar anotações, utilizando Google Sheets como banco de dados e Google Apps Script como backend.

Visão Geral da Arquitetura
Frontend: Um único arquivo index.html que contém a estrutura (HTML), a estilização (CSS) e o comportamento (JavaScript) da interface do usuário. A aplicação é totalmente renderizada no lado do cliente.

Backend: Um arquivo Code.gs (Google Apps Script) que atua como uma API, respondendo às solicitações do frontend. Ele é responsável por toda a lógica de negócios, incluindo acesso e manipulação de dados na planilha Google.

Banco de Dados: Uma planilha Google (Google Sheets) onde os dados são armazenados de forma estruturada em diferentes abas (ex: PESSOAS, ANOTACOES, USUARIOS).

Tecnologias Utilizadas
HTML5: Estrutura da página.
CSS3: Estilização avançada com Flexbox, Grid, gradientes e animações para uma interface moderna.
JavaScript (Vanilla): Manipulação do DOM, lógica da interface, e chamadas assíncronas para o backend.
Google Apps Script: Lógica de servidor para interagir com os serviços do Google (especificamente, Google Sheets).
SortableJS: Biblioteca JavaScript para a funcionalidade de arrastar e soltar.
