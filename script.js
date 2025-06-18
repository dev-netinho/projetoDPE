// Bloco de Auto-Execução para proteger a página
// Ele roda imediatamente ao carregar o script.
(() => {
    const token = localStorage.getItem('authToken');
    // Se NÃO houver token, o usuário não está logado.
    // Redirecionamos imediatamente para a página de login.
    if (!token) {
        window.location.href = 'login.html';
    }
})();


document.addEventListener('DOMContentLoaded', () => {
    // --- REFERÊNCIAS DO DOM ---
    const tabelaBody = document.getElementById('tabelaPresosBody');
    const contadorRegistros = document.getElementById('contadorRegistros');
    const paginacaoContainer = document.getElementById('paginacaoContainer');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    const filtros = {
        nome: document.getElementById('filtroNome'),
        local: document.getElementById('filtroLocal'),
        cor: document.getElementById('filtroCor'),
        regime: document.getElementById('filtroRegime'),
        dataInicio: document.getElementById('filtroDataInicio'),
        dataFim: document.getElementById('filtroDataFim'),
    };
    const modal = document.getElementById('modal');
    const form = document.getElementById('cadastroForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnAdicionarNovo = document.getElementById('btnAdicionarNovo');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    const presoIdInput = document.getElementById('presoId');
    const toastContainer = document.getElementById('toastContainer');
    const btnLogout = document.getElementById('btnLogout');
    const userNameSpan = document.getElementById('userName');

    // --- ESTADO DA APLICAÇÃO ---
    const API_URL = 'https://painel-advocacia-api-netinho.onrender.com/api';
    const TOKEN = localStorage.getItem('authToken');
    let todosPresos = []; 
    let currentPage = 1;
    const rowsPerPage = 15;
    const dataAtual = new Date();

    // --- FUNÇÕES DE LÓGICA DE NEGÓCIO (CÁLCULOS) ---
    const calcularDiasPreso = (data) => data ? Math.max(0, Math.ceil((dataAtual - new Date(data)) / (1000 * 60 * 60 * 24))) : 0;
    const getStatusCor = (dias) => (dias <= 30) ? 'Amarelo' : (dias <= 90) ? 'Laranja' : 'Vermelho';

    // --- FUNÇÕES DE API COM TOKEN ---
    const fetchApi = async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        };

        const config = {
            ...options,
            headers: { ...headers, ...options.headers },
        };

        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            localStorage.clear(); // Limpa tudo
            window.location.href = 'login.html';
            throw new Error('Token inválido ou expirado. Por favor, faça o login novamente.');
        }

        if (response.status === 204) {
            return null;
        }

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Ocorreu um erro na requisição.');
        }

        return responseData;
    };

    const buscarDados = async () => {
        try {
            todosPresos = await fetchApi('/presos');
            aplicarFiltros();
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    };
    
    // --- LÓGICA DO MODAL ---
    const openModal = (isEdit = false, preso = null) => {
        form.reset();
        presoIdInput.value = ''; // Limpa o ID
        if (isEdit && preso) {
            modalTitle.textContent = 'Editar Registro';
            presoIdInput.value = preso.id;
            Object.keys(preso).forEach(key => {
                const input = form.querySelector(`[name=${key}]`);
                if (input) {
                    // Formata a data para o formato YYYY-MM-DD para campos de data
                    if (input.type === 'date' && preso[key]) {
                        input.value = new Date(preso[key]).toISOString().split('T')[0];
                    } else {
                        input.value = preso[key];
                    }
                }
            });
        } else {
            modalTitle.textContent = 'Adicionar Novo Preso';
        }
        modal.classList.remove('hidden');
    };
    const closeModal = () => modal.classList.add('hidden');

    // --- LÓGICA DE NOTIFICAÇÕES (TOASTS) ---
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${"success"===type?"check-circle":"exclamation-circle"}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };
    
    // --- RENDERIZAÇÃO E PAGINAÇÃO ---
    const renderizarTabela = (lista = todosPresos) => {
        tabelaBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const paginatedItems = lista.slice(start, start + rowsPerPage);
        paginatedItems.forEach(preso => {
            const diasPreso = calcularDiasPreso(preso.quando_prendeu);
            const statusCor = getStatusCor(diasPreso).toLowerCase();
            tabelaBody.innerHTML += `
                <tr>
                    <td><span class="status-dot alerta-${statusCor}" title="${statusCor.charAt(0).toUpperCase() + statusCor.slice(1)}"></span></td>
                    <td>${preso.nome}</td>
                    <td>${diasPreso}</td>
                    <td>${preso.unidade_prisional}</td>
                    <td>${new Date(preso.quando_prendeu).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td>${preso.regime_provavel}</td>
                    <td>${preso.reu_primario}</td>
                    <td class="acoes-cell">
                        <button onclick="prepararEdicao('${preso.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                        <button onclick="excluirPreso('${preso.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        contadorRegistros.innerHTML = `<i class="fas fa-list-ul"></i> Mostrando ${paginatedItems.length} de ${lista.length} registros`;
        setupPaginacao(lista);
    };

    const setupPaginacao = (items) => {
        paginacaoContainer.innerHTML = "";
        const pageCount = Math.ceil(items.length / rowsPerPage);
        if (pageCount <= 1) return;
        const createButton = (text, page, isDisabled = false) => {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
            btn.innerHTML = text;
            btn.disabled = isDisabled;
            btn.addEventListener('click', () => {
                currentPage = page;
                renderizarTabela(aplicarFiltros(false));
            });
            return btn;
        };
        o.appendChild(n('<i class="fas fa-angle-left"></i>',v-1,1===v));for(let t=1;t<=pageCount;t++){const a=n(t,t);t===v&&a.classList.add("active"),o.appendChild(a)}o.appendChild(n('<i class="fas fa-angle-right"></i>',v+1,v===pageCount));
    };

    // --- CRUD E FILTROS ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = presoIdInput.value;
        const dadosForm = new FormData(form);
        const dadosPreso = Object.fromEntries(dadosForm.entries());
        
        if (!dadosPreso.ultima_revisao) delete dadosPreso.ultima_revisao;
        if (id) delete dadosPreso.id;

        try {
            const endpoint = id ? `/presos/${id}` : '/presos';
            const method = id ? 'PUT' : 'POST';

            await fetchApi(endpoint, {
                method: method,
                body: JSON.stringify(dadosPreso)
            });
            
            showToast(id ? 'Registro atualizado com sucesso!' : 'Novo preso cadastrado com sucesso!');
            closeModal();
            buscarDados();
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    });

    window.prepararEdicao = (id) => {
        const preso = todosPresos.find(p => p.id === id);
        if (preso) openModal(true, preso);
    };
    
    window.excluirPreso = async (id) => {
        if (confirm('Tem certeza que deseja excluir permanentemente este registro?')) {
            try {
                await fetchApi(`/presos/${id}`, { method: 'DELETE' });
                showToast('Registro excluído.', 'error');
                buscarDados();
            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
            }
        }
    };
    
    const aplicarFiltros = (resetPage = true) => {
        if(resetPage) currentPage = 1;
        let presosFiltrados = [...todosPresos];
        
        const nomeTermo = filtros.nome.value.toLowerCase();
        if (nomeTermo) presosFiltrados = presosFiltrados.filter(p => p.nome.toLowerCase().includes(nomeTermo));
        if (filtros.local.value) presosFiltrados = presosFiltrados.filter(p => p.unidade_prisional === filtros.local.value);
        if (filtros.regime.value) presosFiltrados = presosFiltrados.filter(p => p.regime_provavel === filtros.regime.value);
        if (filtros.cor.value) presosFiltrados = presosFiltrados.filter(p => getStatusCor(calcularDiasPreso(p.quando_prendeu)) === filtros.cor.value);
        if (filtros.dataInicio.value) presosFiltrados = presosFiltrados.filter(p => p.quando_prendeu >= filtros.dataInicio.value);
        if (filtros.dataFim.value) presosFiltrados = presosFiltrados.filter(p => p.quando_prendeu <= filtros.dataFim.value);

        renderizarTabela(presosFiltrados);
        return presosFiltrados;
    };
    
    const configurarLogout = () => {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    };

    const exibirInfoUsuario = () => {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            userNameSpan.textContent = `Olá, ${userData.full_name || userData.email}`;
        }
    };

    // --- INICIALIZAÇÃO ---
    if (TOKEN) {
        exibirInfoUsuario();
        configurarLogout();
        buscarDados();
        
        r.addEventListener("click",()=>openModal());
        l.addEventListener("click",closeModal);
        c.addEventListener("click",closeModal);
        d.addEventListener("click",t=>{t.target===d&&closeModal()});
        n.addEventListener("click",()=>{Object.values(a).forEach(t=>t.value=""),aplicarFiltros()});
        Object.values(a).forEach(t=>t.addEventListener("input",()=>aplicarFiltros()));
    }
});