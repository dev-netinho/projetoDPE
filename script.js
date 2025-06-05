document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const listaPresosDiv = document.getElementById('listaPresos');
    const filtroNomeInput = document.getElementById('filtroNome');

    // Sons (opcional - requer arquivos .mp3)
    const alertaSonoroCurto = document.getElementById('alertaSonoroCurto');
    const alertaSonoroLongo = document.getElementById('alertaSonoroLongo');

    // Carrega presos do localStorage
    let presos = JSON.parse(localStorage.getItem('presos')) || [];

    // Função para salvar presos no localStorage
    const salvarPresos = () => {
        localStorage.setItem('presos', JSON.stringify(presos));
    };

    // Função para calcular dias preso
    const calcularDiasPreso = (dataPrisao) => {
        if (!dataPrisao) return 'N/A';
        const dataInicio = new Date(dataPrisao);
        const dataAtual = new Date();
        // Zera a hora para comparar apenas as datas
        dataInicio.setHours(0, 0, 0, 0);
        dataAtual.setHours(0, 0, 0, 0);
        const diferenca = dataAtual.getTime() - dataInicio.getTime();
        return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
    };

    // Função para determinar o status de alerta
    const getStatusAlerta = (dataRevisaoStr) => {
        if (!dataRevisaoStr) return 'alerta-verde'; // Sem data de revisão, considera normal

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera horas para comparação de dias

        const dataRevisao = new Date(dataRevisaoStr);
        dataRevisao.setHours(0,0,0,0); // Zera horas

        const umDiaEmMs = 1000 * 60 * 60 * 24;
        const diffEmDias = Math.round((dataRevisao - hoje) / umDiaEmMs);

        if (diffEmDias < 0) {
            return 'alerta-vermelho'; // Data de revisão passou
        } else if (diffEmDias <= 7) {
            return 'alerta-amarelo'; // Data de revisão nos próximos 7 dias
        }
        return 'alerta-verde'; // Data de revisão futura ou sem data
    };

    // Função para tocar som (exemplo)
    const tocarSom = (tipo) => {
        // Descomente e certifique-se que os arquivos .mp3 existem na mesma pasta
        /*
        if (tipo === 'curto' && alertaSonoroCurto) {
            alertaSonoroCurto.play().catch(e => console.warn("Erro ao tocar som curto:", e));
        } else if (tipo === 'longo' && alertaSonoroLongo) {
            alertaSonoroLongo.play().catch(e => console.warn("Erro ao tocar som longo:", e));
        }
        */
       console.log(`Placeholder: Tocar som do tipo ${tipo}`);
    };

    // Função para renderizar a lista de presos
    const renderizarPresos = (presosFiltrados = presos) => {
        listaPresosDiv.innerHTML = ''; // Limpa a lista atual
        if (presosFiltrados.length === 0 && presos.length > 0 && filtroNomeInput.value) {
             listaPresosDiv.innerHTML = '<p class="nenhum-resultado">Nenhum preso encontrado com este nome.</p>';
        }

        presosFiltrados.sort((a, b) => new Date(b.quandoPrendeu) - new Date(a.quandoPrendeu)); // Mais recentes primeiro

        presosFiltrados.forEach((preso, index) => {
            const diasPreso = calcularDiasPreso(preso.quandoPrendeu);
            const classeAlerta = getStatusAlerta(preso.dataRevisao);

            const presoCard = document.createElement('div');
            presoCard.classList.add('preso-card', classeAlerta);
            presoCard.dataset.id = preso.id;

            presoCard.innerHTML = `
                <h3>${preso.nome}</h3>
                <p><strong>ID:</strong> ${preso.id.slice(-6)}</p> <p><strong>Preso por:</strong> ${preso.quemPrendeu}</p>
                <p><strong>Data da Prisão:</strong> ${new Date(preso.quandoPrendeu).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                <p class="dias-preso"><strong>Dias Preso:</strong> ${diasPreso}</p>
                <p><strong>Data para Revisão:</strong> ${preso.dataRevisao ? new Date(preso.dataRevisao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não definida'}</p>
                <p><strong>Motivo:</strong> ${preso.motivoPrisao || 'Não informado'}</p>
                <p><strong>Local:</strong> ${preso.localDetencao || 'Não informado'}</p>
                <p><strong>Observações:</strong> ${preso.observacao || 'Nenhuma'}</p>
                <div class="acoes">
                    <button class="btn-editar" onclick="editarPreso('${preso.id}')">Editar</button>
                    <button class="btn-excluir" onclick="excluirPreso('${preso.id}')">Excluir</button>
                </div>
            `;
            listaPresosDiv.appendChild(presoCard);

            // Toca som para alertas críticos ao renderizar (exemplo)
            if (classeAlerta === 'alerta-vermelho') {
                // tocarSom('longo'); // Pode ser irritante se muitos estiverem assim
            } else if (classeAlerta === 'alerta-amarelo') {
                // tocarSom('curto');
            }
        });
    };

    // Função para lidar com o cadastro
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const novoPreso = {
            id: 'preso-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9), // ID único
            nome: document.getElementById('nome').value.trim(),
            quemPrendeu: document.getElementById('quemPrendeu').value.trim(),
            quandoPrendeu: document.getElementById('quandoPrendeu').value,
            dataRevisao: document.getElementById('dataRevisao').value,
            observacao: document.getElementById('observacao').value.trim(),
            motivoPrisao: document.getElementById('motivoPrisao').value.trim(),
            localDetencao: document.getElementById('localDetencao').value.trim()
        };

        if (!novoPreso.nome || !novoPreso.quemPrendeu || !novoPreso.quandoPrendeu) {
            alert("Nome, Quem Prendeu e Quando Prendeu são campos obrigatórios.");
            return;
        }

        presos.push(novoPreso);
        salvarPresos();
        renderizarPresos();
        form.reset(); // Limpa o formulário

        // Feedback sonoro e visual ao adicionar
        const statusNovo = getStatusAlerta(novoPreso.dataRevisao);
        if (statusNovo === 'alerta-vermelho') {
            tocarSom('longo');
            alert(`Atenção! Preso ${novoPreso.nome} cadastrado com status de ALERTA VERMELHO.`);
        } else if (statusNovo === 'alerta-amarelo') {
            tocarSom('curto');
            alert(`Atenção! Preso ${novoPreso.nome} cadastrado com status de ALERTA AMARELO.`);
        }
    });

    // Função para excluir preso
    window.excluirPreso = (id) => { // Torna a função acessível globalmente para o onclick
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            presos = presos.filter(p => p.id !== id);
            salvarPresos();
            renderizarPresos();
        }
    };

    // Função para editar preso (simplificada: preenche o formulário para edição)
    // Uma implementação mais robusta teria um modal de edição ou alteraria o formulário existente.
    window.editarPreso = (id) => {
        const presoParaEditar = presos.find(p => p.id === id);
        if (presoParaEditar) {
            document.getElementById('nome').value = presoParaEditar.nome;
            document.getElementById('quemPrendeu').value = presoParaEditar.quemPrendeu;
            document.getElementById('quandoPrendeu').value = presoParaEditar.quandoPrendeu;
            document.getElementById('dataRevisao').value = presoParaEditar.dataRevisao;
            document.getElementById('observacao').value = presoParaEditar.observacao;
            document.getElementById('motivoPrisao').value = presoParaEditar.motivoPrisao;
            document.getElementById('localDetencao').value = presoParaEditar.localDetencao;


            // Remove o preso da lista para evitar duplicidade ao salvar após edição
            // Uma abordagem melhor seria atualizar o item existente ou ter um ID de edição no form.
            presos = presos.filter(p => p.id !== id);
            salvarPresos(); // Salva a lista sem o item que está sendo editado
            renderizarPresos(); // Atualiza a lista visualmente
            alert("Dados do preso carregados no formulário para edição. Faça as alterações e clique em 'Cadastrar Preso' para salvar. O ID original será mantido se você salvar como um 'novo' cadastro após esta ação, ou um novo será gerado. Para manter o ID, você precisaria de uma lógica de 'atualização' mais complexa.");
            // Para uma edição real, você adicionaria um campo hidden com o ID e o botão mudaria para "Atualizar Preso"
            // e a lógica de submit faria um update em vez de um push.
        }
    };

    // Filtro por nome
    filtroNomeInput.addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase();
        const presosFiltrados = presos.filter(preso =>
            preso.nome.toLowerCase().includes(termoBusca)
        );
        renderizarPresos(presosFiltrados);
    });


    // Renderiza a lista inicial
    renderizarPresos();
});