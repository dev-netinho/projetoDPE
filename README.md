# Painel de Gestão para Advocacia (Full-Stack)

![Licença](https://img.shields.io/badge/licença-MIT-blue.svg)

Um painel de controle full-stack, moderno e responsivo, para gerenciamento de casos de detentos. Desenvolvido como uma ferramenta segura e de alta performance para advogados que necessitam de uma forma prática e visual para acompanhar prazos, informações cruciais e gerar relatórios.

---

## ✨ Funcionalidades

O sistema conta com um ciclo completo de funcionalidades para gestão de clientes, com foco em segurança e produtividade.

-   **Autenticação Segura:** Sistema completo de registro e login de usuários. As senhas são criptografadas e o acesso às rotas é protegido por JSON Web Token (JWT), garantindo que apenas usuários autorizados possam manipular os dados.

-   **Dashboard de Clientes (Presos):**
    -   CRUD completo (Criar, Ler, Editar, Deletar) para os registros dos clientes.
    -   Interface limpa em tabela com paginação para lidar com grandes volumes de dados.

-   **Sistema de Status Visual:** Classificação automática dos casos por cores (Amarelo, Laranja, Vermelho) com base no tempo de detenção, permitindo uma identificação visual rápida da situação.

-   **Ordenação Inteligente por Urgência:** A lista é, por padrão, ordenada pela criticidade do caso, colocando os clientes com status mais grave ou mais próximos de mudar de status no topo da lista.

-   **Filtragem Avançada:** Ferramentas de filtro por nome, unidade prisional, status, regime provável e período, permitindo encontrar informações específicas rapidamente.

-   **Ações em Massa:**
    -   Seleção múltipla de registros através de checkboxes.
    -   Exclusão de vários clientes de uma só vez, otimizando o tempo de gerenciamento.

-   **Geração de Relatórios em PDF:** Exportação da lista de clientes (respeitando os filtros aplicados) para um arquivo PDF profissional com um único clique.

-   **Arquitetura Full-Stack:**
    -   **Front-end** desacoplado, construído com HTML, CSS e JavaScript puro.
    -   **Back-end** com uma API RESTful robusta construída em Node.js e Express.
    -   **Banco de Dados** PostgreSQL na nuvem, gerenciado pelo Supabase.

---

## 🚀 Tecnologias Utilizadas

#### **Front-end**
-   HTML5
-   CSS3 (com Variáveis, Flexbox e Grid)
-   JavaScript (ES6+)
-   **Bibliotecas:**
    -   jsPDF & jspdf-autotable (para geração de relatórios)
    -   Font Awesome (para iconografia)

#### **Back-end**
-   Node.js
-   Express.js
-   Supabase (PostgreSQL)
-   **Bibliotecas:**
    -   `jsonwebtoken` (para autenticação com JWT)
    * `bcryptjs` (para criptografia de senhas)
    * `cors` (para segurança de comunicação entre domínios)
    * `dotenv` (para gerenciamento de variáveis de ambiente)

---

## 🛠️ Configuração do Ambiente Local

O projeto é dividido em dois repositórios/pastas: `frontend` e `backend`.

### Configurando o Back-end
1.  Navegue até a pasta do back-end.
2.  Crie um arquivo `.env` na raiz e adicione as seguintes variáveis com suas chaves:
    ```
    SUPABASE_URL=SUA_URL_DO_SUPABASE
    SUPABASE_KEY=SUA_CHAVE_ANON_PUBLIC
    JWT_SECRET=SEU_SEGREDO_JWT_ALEATORIO
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  (Opcional) Popule o banco de dados com dados de teste:
    ```bash
    node seed.js
    ```
5.  Inicie o servidor local:
    ```bash
    node index.js
    ```
    O servidor estará rodando em `http://localhost:3000`.

### Configurando o Front-end
1.  Nenhuma instalação é necessária.
2.  Abra o arquivo `login.html` ou `index.html` em seu navegador.
3.  **Importante:** Certifique-se de que a variável `API_URL` no topo do arquivo `script.js` e `login.js` está apontando para o endereço correto do seu back-end (local ou online).

---

## ☁️ Arquitetura de Deploy

-   **Front-end:** Hospedado como um site estático no **GitHub Pages**.
-   **Back-end:** Hospedado como um serviço web no **Render.com**.
-   **Banco de Dados:** PostgreSQL hospedado e gerenciado pelo **Supabase**.

---

## 👨‍💻 Autor

Desenvolvido por **José Neto**.

<div style="display: flex; gap: 10px;">
    <a href="https://github.com/dev-netinho/" target="_blank">
        <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
    <a href="https://www.linkedin.com/in/jose-gc-neto/" target="_blank">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
    </a>
    <a href="https://www.instagram.com/netinho_gc/" target="_blank">
        <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram">
    </a>
</div>

## 📄 Licença

Este projeto está sob a licença MIT.