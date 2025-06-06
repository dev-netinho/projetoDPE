# Painel de Gestão para Advocacia

![Licença](https://img.shields.io/badge/licença-MIT-blue.svg)

Um painel de controle moderno e responsivo para gerenciamento de casos de detentos, desenvolvido para advogados que necessitam de uma ferramenta prática e visual para acompanhar prazos e informações cruciais dos seus clientes.

## 🖼️ Visualização

*A interface principal do painel, mostrando a listagem de clientes com o sistema de cores e filtros.*

![Painel de Gestão Screenshot](https://i.imgur.com/Gj8x35c.png)

*O formulário de cadastro/edição em um modal limpo e intuitivo.*

![Modal de Cadastro Screenshot](https://i.imgur.com/83u6V1r.png)

## ✨ Funcionalidades Principais

-   **Cadastro e Edição de Clientes:** Gerencie informações detalhadas dos clientes através de um formulário intuitivo em um modal.
-   **Sistema de Alerta Visual por Cores:**
    -   🟡 **Amarelo:** Clientes com 0 a 30 dias de detenção.
    -   🟠 **Laranja:** Clientes com 31 a 90 dias de detenção.
    -   🔴 **Vermelho:** Clientes com mais de 90 dias de detenção.
-   **Filtragem Avançada:** Encontre clientes rapidamente usando múltiplos critérios de busca, como nome, unidade prisional, status (cor), regime provável e período da prisão.
-   **Paginação Automática:** A lista de clientes é dividida em páginas para garantir a performance e a organização, mesmo com centenas de registros.
-   **Interface Moderna e Responsiva:** O design se adapta perfeitamente a qualquer dispositivo, seja desktop, tablet ou celular (Mobile-First).
-   **Persistência de Dados Local:** Todas as informações são salvas diretamente no navegador (`localStorage`), garantindo que os dados não sejam perdidos ao fechar a aba.
-   **Notificações Interativas:** Feedback visual para ações (salvar, editar, excluir) através de toasts, sem interromper o fluxo de trabalho.

## 🚀 Tecnologias Utilizadas

Este projeto é construído puramente com tecnologias front-end, sem a necessidade de um back-end ou compilação.

-   **HTML5:** Estrutura semântica e moderna.
-   **CSS3:** Estilização avançada com Variáveis CSS, Flexbox e Grid Layout.
-   **JavaScript (ES6+):** Toda a lógica interativa, manipulação de dados e interações com o DOM.
-   **Font Awesome:** Biblioteca de ícones para uma interface mais intuitiva.
-   **Google Fonts:** Tipografia moderna e legível (família Poppins).

## 🛠️ Instalação e Execução

Como este é um projeto front-end puro, não há necessidade de instalação de dependências ou processos de build.

1.  **Clone o repositório (ou baixe os arquivos):**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    ```
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd seu-repositorio
    ```
3.  **Abra o arquivo `index.html`:**
    -   Simplesmente abra o arquivo `index.html` em seu navegador de preferência (Google Chrome, Firefox, etc.).

E pronto! A aplicação estará rodando localmente.

## 🧪 Como Popular com Dados de Teste

Para testar a aplicação com um grande volume de dados, você pode usar o script de geração de dados fictícios.

1.  Abra a aplicação no navegador.
2.  Abra o Console do Desenvolvedor (`F12`).
3.  Copie e cole o script de geração de dados (disponibilizado anteriormente) no console e pressione `Enter`.
4.  Atualize a página (`F5`). A tabela será populada com 100 registros de teste.

## 👨‍💻 Autor

Desenvolvido com dedicação por José Neto. Entre em contato ou acompanhe meus outros projetos!

<div style="display: flex; gap: 10px;">
    <a href="https://github.com/dev-netinho/" target="_blank">
        <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
    <a href="https://www.linkedin.com/in/jose-gc-neto/" target="_blank">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
    </a>
    <a href="https://www.instagram.com/eu.josenetosz/" target="_blank">
        <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram">
    </a>
</div>

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.