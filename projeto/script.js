const cameraFeed = document.getElementById('camera-feed');
const photoCanvas = document.createElement('canvas'); // Criamos dinamicamente para não mostrar
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');

const cameraSection = document.getElementById('camera-section');
const resultsSection = document.getElementById('results-section');
const capturedImageDisplay = document.getElementById('captured-image-display');
const plantNameElement = document.getElementById('plant-name');
const confidenceScoreElement = document.getElementById('confidence-score');
const loadingText = document.querySelector('.loading');
const errorMessage = document.querySelector('.error-message');
const instructionText = document.querySelector('.instruction-text');

const apiKey = 'SUA_CHAVE_DA_API_AQUI'; // <<< SUBSTITUA PELA SUA CHAVE REAL DA PLANTNET

let currentStream; // Para armazenar o stream da câmera e poder parar

// --- Funções de Visibilidade ---
function showCameraSection() {
    cameraSection.style.display = 'block';
    resultsSection.style.display = 'none';
    loadingText.style.display = 'none';
    errorMessage.style.display = 'none';
    instructionText.style.display = 'block';
    captureBtn.style.display = 'block';
}

function showResultsSection() {
    cameraSection.style.display = 'none';
    resultsSection.style.display = 'block';
    loadingText.style.display = 'none';
    instructionText.style.display = 'none';
}

function showLoading() {
    loadingText.style.display = 'block';
    errorMessage.style.display = 'none';
    instructionText.style.display = 'none';
    captureBtn.style.display = 'none';
}

function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    loadingText.style.display = 'none';
    instructionText.style.display = 'none';
    captureBtn.style.display = 'block'; // Permite tentar de novo
}

// --- 1. Configurar e Iniciar a Câmera ---
async function startCamera() {
    // Parar o stream anterior se houver
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // Preferência para a câmera traseira (environment)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        currentStream = stream;
        cameraFeed.srcObject = stream;
        cameraFeed.play();
        showCameraSection();
    } catch (err) {
        console.error("Erro ao acessar a câmera: ", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            showErrorMessage("Permissão da câmera negada. Por favor, conceda acesso nas configurações do seu navegador.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
             showErrorMessage("Nenhuma câmera encontrada. Verifique se o dispositivo possui uma.");
        } else {
            showErrorMessage("Não foi possível iniciar a câmera. Erro: " + err.message);
        }
    }
}

// --- 2. Tirar Foto e Preparar para Envio ---
captureBtn.addEventListener('click', () => {
    if (!currentStream) {
        showErrorMessage("Câmera não iniciada.");
        return;
    }

    // Define as dimensões do canvas para a imagem da câmera
    photoCanvas.width = cameraFeed.videoWidth;
    photoCanvas.height = cameraFeed.videoHeight;
    photoCanvas.getContext('2d').drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);

    // Exibe a imagem capturada no display de resultados (opcional, para visualização)
    capturedImageDisplay.src = photoCanvas.toDataURL('image/jpeg');

    showLoading();
    
    // Converte o canvas para um Blob (arquivo de imagem)
    photoCanvas.toBlob(blob => {
        if (blob) {
            sendToPlantNetAPI(blob);
        } else {
            showErrorMessage("Erro ao capturar a imagem.");
        }
    }, 'image/jpeg', 0.9); // 0.9 é a qualidade JPEG
});

// --- 3. Enviar Imagem para a API da PlantNet ---
async function sendToPlantNetAPI(imageBlob) {
    const formData = new FormData();
    formData.append('images', imageBlob, 'photo.jpg'); // O nome 'images' é o esperado pela API

    // Parametros adicionais na URL: 'include-related-images=false' para respostas mais rápidas
    const apiUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&include-related-images=false`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) { // Se a resposta não for 2xx (ex: 400, 401, 500)
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro da API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        handleApiResponse(data);

    } catch (err) {
        console.error("Erro na comunicação com a API:", err);
        if (err.message.includes("api-key")) {
             showErrorMessage("Erro: Sua Chave da API pode estar incorreta ou expirada. Verifique-a!");
        } else {
             showErrorMessage(`Erro ao se comunicar com a API. Tente novamente. Detalhes: ${err.message}`);
        }
    }
}

// --- 4. Processar e Exibir os Resultados da API ---
function handleApiResponse(data) {
    showResultsSection();

    if (data.results && data.results.length > 0) {
        const bestMatch = data.results[0]; // Pega a identificação com maior confiança
        
        let commonName = 'Nome Comum Não Disponível';
        if (bestMatch.species.commonNames && bestMatch.species.commonNames.length > 0) {
            commonName = bestMatch.species.commonNames[0];
        }

        const scientificName = bestMatch.species.scientificNameWithoutAuthor || 'Nome Científico Não Disponível';
        const confidence = (bestMatch.score * 100).toFixed(2);

        plantNameElement.textContent = `Planta: ${commonName}`;
        confidenceScoreElement.textContent = `Confiança: ${confidence}% (${scientificName})`;

        // Se a API retornar uma imagem de exemplo, você pode usá-la aqui
        // Exemplo: if (bestMatch.images && bestMatch.images.length > 0) { capturedImageDisplay.src = bestMatch.images[0].url.m; }

    } else {
        plantNameElement.textContent = 'Nenhuma planta identificada com alta confiança.';
        confidenceScoreElement.textContent = 'Tente tirar uma foto mais nítida ou de outro ângulo.';
    }
}

// --- 5. Voltar para a Câmera ---
retakeBtn.addEventListener('click', () => {
    startCamera(); // Reinicia a câmera para tirar outra foto
});

// --- Iniciar o Aplicativo ---
window.addEventListener('load', startCamera);