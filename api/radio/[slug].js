import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const { slug } = req.query;

  // Sanitiza o slug pra evitar path traversal
  const safeSlug = slug.replace(/[^a-z0-9-_]/gi, '');

  const filePath = join(process.cwd(), 'api', 'radios', `${safeSlug}.json`);

  if (!existsSync(filePath)) {
    return res.status(404).json({
      error: 'Rádio não encontrada',
      message: `Nenhuma rádio com slug "${safeSlug}" foi cadastrada.`,
    });
  }

  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    // Cache de 5 minutos
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Erro ao carregar dados da rádio',
      message: err.message,
    });
  }
}
