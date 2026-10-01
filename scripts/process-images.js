const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Pasta onde estão as fotos originais
const inputDir = "C:\\Users\\MURYL\\Pictures\\originais-quitelikemybrothers";

// Pasta onde serão colocadas as versões processadas
const outputDir = path.join(inputDir, "processadas");

const thumbnailDir = path.join(outputDir, "thumbnails");
const largeDir = path.join(outputDir, "large");

// Arquivo JSON com os dados das imagens
const jsonPath = path.join(outputDir, "images.json");

// Configurações
const THUMBNAIL_SIZE = 1200;
const LARGE_SIZE = 4000;

const THUMBNAIL_QUALITY = 85;
const LARGE_QUALITY = 92;

async function processImages() {
    // Cria as pastas caso ainda não existam
    fs.mkdirSync(thumbnailDir, { recursive: true });
    fs.mkdirSync(largeDir, { recursive: true });

    // Pega os arquivos da pasta original
    const files = fs.readdirSync(inputDir);

    // Aceita estes formatos
    const imageFiles = files.filter(file =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
        console.log("Nenhuma imagem encontrada.");
        return;
    }

    console.log(`Encontradas ${imageFiles.length} imagens.\n`);

    const images = [];

    for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const name = path.parse(file).name;

        const thumbnailPath = path.join(
            thumbnailDir,
            `${name}.webp`
        );

        const largePath = path.join(
            largeDir,
            `${name}.webp`
        );

        console.log(`Processando: ${file}`);

        // THUMBNAIL
        if (fs.existsSync(thumbnailPath)) {
            console.log("  → Thumbnail já existe. Pulando.");
        } else {
            await sharp(inputPath)
                .rotate()
                .resize({
                    width: THUMBNAIL_SIZE,
                    height: THUMBNAIL_SIZE,
                    fit: "inside",
                    withoutEnlargement: true
                })
                .webp({
                    quality: THUMBNAIL_QUALITY
                })
                .toFile(thumbnailPath);

            console.log("  ✓ Thumbnail criada.");
        }

        // LARGE
        if (fs.existsSync(largePath)) {
            console.log("  → Large já existe. Pulando.");
        } else {
            await sharp(inputPath)
                .rotate()
                .resize({
                    width: LARGE_SIZE,
                    height: LARGE_SIZE,
                    fit: "inside",
                    withoutEnlargement: true
                })
                .webp({
                    quality: LARGE_QUALITY
                })
                .toFile(largePath);

            console.log("  ✓ Large criada.");
        }

        // Adiciona a imagem ao JSON
        images.push({
            name: name,
            thumbnail: `thumbnails/${name}.webp`,
            large: `large/${name}.webp`
        });

        console.log("");
    }

    // Gera o JSON
    fs.writeFileSync(
        jsonPath,
        JSON.stringify(images, null, 2),
        "utf8"
    );

    console.log("================================");
    console.log("Conversão concluída!");
    console.log("================================");
    console.log(`JSON criado em: ${jsonPath}`);
}

processImages().catch(error => {
    console.error("Erro durante o processamento:");
    console.error(error);
    process.exit(1);
});