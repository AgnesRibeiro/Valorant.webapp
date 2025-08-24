const apiURL = 'https://valorant-api.com/v1/agents'
const searchInput = document.getElementById('searchInput')

const agentDescriptionsPT = {
  Brimstone:
    'Brimstone é uma Controladora americana que utiliza utilitários aéreos e fumaça estratégica para fornecer suporte tático.',
  Phoenix:
    'Phoenix é um Duelista britânico que manipula fogo para atacar e se curar.',
  Sage: 'Sage é uma Sentinela chinesa que protege seus aliados com habilidades de cura e barreiras.',
  Sova: 'Sova é um Iniciador russo que rastreia inimigos com seus drones e flechas.',
  Viper:
    'Viper é uma Controladora americana que utiliza toxinas para controlar o campo de batalha.',
  Cypher:
    'Cypher é um Sentinela marroquino que coleta informações e protege áreas com suas câmeras e armadilhas.',
  Reyna:
    'Reyna é uma Duelista mexicana que absorve a energia vital de suas vítimas para se curar e se fortalecer.',
  Killjoy:
    'Killjoy é uma Sentinela alemã que utiliza dispositivos tecnológicos para controlar o campo de batalha.',
  Breach:
    'Breach é um Iniciador sueco que utiliza habilidades sísmicas para desorientar e atacar os inimigos.',
  Omen: 'Omen é um Controlador misterioso que manipula sombras para se mover e cegar os inimigos.',
  Jett: 'Jett é uma Duelista sul-coreana ágil que utiliza vento para se mover rapidamente e atacar.',
  Raze: 'Raze é uma Duelista brasileira que utiliza explosivos e dispositivos para causar danos massivos.',
  Skye: 'Skye é uma Iniciadora australiana que utiliza habilidades de cura e controle para apoiar sua equipe.',
  Yoru: 'Yoru é um Duelista japonês que utiliza habilidades de distorção e teletransporte para confundir os inimigos.',
  Astra:
    'Astra é uma Controladora ganesa que manipula energias cósmicas para controlar o campo de batalha.',
  'KAY/O':
    'KAY/O é um Iniciador americano que utiliza habilidades para neutralizar as habilidades dos inimigos.',
  Chamber:
    'Chamber é um Sentinela francês que utiliza armas de precisão e dispositivos para controlar áreas.',
  Neon: 'Neon é uma Duelista filipina que utiliza eletricidade para se mover rapidamente e atacar.',
  Fade: 'Fade é uma Iniciadora turca que utiliza habilidades para rastrear e desorientar os inimigos.',
  Harbor:
    'Harbor é um Controlador indiano que utiliza habilidades aquáticas para controlar o campo de batalha.',
  Gekko:
    'Gekko é um Iniciador americano que utiliza habilidades de controle e suporte para sua equipe.',
  Deadlock:
    'Deadlock é uma Sentinela escocesa que utiliza habilidades de controle e defesa para proteger sua equipe.',
  Iso: 'Iso é um Duelista escocês que utiliza habilidades de controle e suporte para sua equipe.',
  Clove:
    'Clove é uma Controladora escocesa que utiliza habilidades de controle e defesa para proteger sua equipe.',
  Vyse: 'Vyse é uma Sentinela escocesa que utiliza habilidades de controle e suporte para sua equipe.',
  Tejo: 'Tejo é um Iniciador português que utiliza habilidades de controle e suporte para sua equipe.',
  Waylay:
    'Waylay é uma Duelista escocesa que utiliza habilidades de controle e defesa para proteger sua equipe.'
}

// Containers separados
const containers = {
  DUELISTA: document.getElementById('duelistContainer'),
  SENTINELA: document.getElementById('sentinelContainer'),
  INICIADOR: document.getElementById('initiatorContainer'),
  CONTROLADOR: document.getElementById('controllerContainer'),
  'SEM FUNÇÃO': document.createElement('div') // fallback
}

// Mapa de tradução de funções
const roleMap = {
  Duelist: 'DUELISTA',
  Sentinel: 'SENTINELA',
  Initiator: 'INICIADOR',
  Controller: 'CONTROLADOR',
  null: 'SEM FUNÇÃO'
}

// Modal elements
const agentModal = document.getElementById('agentModal')
const closeModal = document.getElementById('closeModal')
const modalImage = document.getElementById('modalImage')
const modalName = document.getElementById('modalName')
const modalRole = document.getElementById('modalRole')
const modalDescription = document.getElementById('modalDescription')

// Função para criar card de agente
function createCard(agent) {
  const card = document.createElement('div')
  card.classList.add('agent-card')

  card.innerHTML = `
        <img src="${agent.displayIcon}" alt="${agent.displayName}">
        <h3>${agent.displayName}</h3>
        <p>${roleMap[agent.role?.displayName]}</p>
    `

  card.addEventListener('click', () => {
    modalImage.src = agent.fullPortrait || agent.displayIcon
    modalName.textContent = agent.displayName
    modalRole.textContent = roleMap[agent.role?.displayName]
    modalDescription.textContent =
      agentDescriptionsPT[agent.displayName] || agent.description
    agentModal.style.display = 'block'
  })

  return card
}

// Exibir agentes por categoria
function displayAgents(agents) {
  Object.values(containers).forEach(c => (c.innerHTML = ''))

  agents.forEach(agent => {
    if (!agent.isPlayableCharacter) return
    const role = roleMap[agent.role?.displayName] || 'SEM FUNÇÃO'
    const card = createCard(agent)
    containers[role].appendChild(card)
  })
}

// Fechar modal
closeModal.addEventListener('click', () => {
  agentModal.style.display = 'none'
})
window.addEventListener('click', event => {
  if (event.target == agentModal) agentModal.style.display = 'none'
})

// Buscar agentes da API
async function fetchAgents() {
  try {
    const response = await fetch(apiURL)
    const data = await response.json()
    displayAgents(data.data)
  } catch (error) {
    console.error(error)
  }
}

// Pesquisa em tempo real
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase()
  document.querySelectorAll('.agent-card').forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase()
    card.style.display = name.includes(filter) ? 'block' : 'none'
  })
})

fetchAgents()
