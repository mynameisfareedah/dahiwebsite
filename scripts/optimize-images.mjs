import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = 'C:/Users/USER/Documents/FINAL DOC ADI PAGE';

const formatSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const targets = [
  {
    input: 'public/community-480.jpg',
    output: 'public/community-480.webp',
    options: { webp: { quality: 82 } },
  },
  {
    input: 'public/community-768.jpg',
    output: 'public/community-768.webp',
    options: { webp: { quality: 82 } },
  },
  {
    input: 'public/community-1200.jpg',
    output: 'public/community-1200.webp',
    options: { webp: { quality: 82 } },
  },
  {
    input: 'public/outreach-poster.jpeg',
    output: 'public/outreach-poster-960.webp',
    options: { resize: { width: 960, withoutEnlargement: true }, webp: { quality: 80 } },
  },
  {
    input: 'public/outreach-poster.jpeg',
    output: 'public/outreach-poster-640.webp',
    options: { resize: { width: 640, withoutEnlargement: true }, webp: { quality: 80 } },
  },
  {
    input: 'public/docadi.jpeg',
    output: 'public/docadi-320.webp',
    options: { resize: { width: 320, height: 320, fit: 'cover', position: 'attention' }, webp: { quality: 82 } },
  },
];

const results = [];

for (const target of targets) {
  const inputPath = path.join(root, target.input);
  const outputPath = path.join(root, target.output);
  const transformer = sharp(inputPath);

  if (target.options.resize) {
    transformer.resize(target.options.resize);
  }

  await transformer.webp(target.options.webp).toFile(outputPath);

  const inputMeta = await sharp(inputPath).metadata();
  const outputMeta = await sharp(outputPath).metadata();
  const inputSize = fs.statSync(inputPath).size;
  const outputSize = fs.statSync(outputPath).size;

  results.push({
    input: target.input,
    output: target.output,
    inputSize,
    outputSize,
    inputDimensions: `${inputMeta.width}x${inputMeta.height}`,
    outputDimensions: `${outputMeta.width}x${outputMeta.height}`,
  });
}

for (const result of results) {
  console.log(
    [
      `${result.input} -> ${result.output}`,
      `${result.inputDimensions} ${formatSize(result.inputSize)} -> ${result.outputDimensions} ${formatSize(result.outputSize)}`,
    ].join(' | '),
  );
}